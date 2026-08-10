import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  getCache,
  setCache,
  generateUserListCacheKey,
  invalidateUsersCache,
  invalidatePostsCache,
} from '../config/cache.js';
import { parsePgInt } from '../utils/validation.js';
import cloudinary from '../config/cloudinary.js';

const formatCloudinaryAvatar = (url?: string | null, size = 160): string | null => {
  if (!url) return null;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8);
      const rest = url.substring(uploadIndex + 8);
      const transform = `c_fill,g_face,w_${size},h_${size},q_auto,f_auto/`;
      if (
        rest.startsWith('c_fill') ||
        rest.startsWith('w_') ||
        rest.startsWith('c_scale') ||
        rest.startsWith('c_crop')
      ) {
        return prefix + transform + rest.replace(/^[^/]+\//, '');
      }
      return prefix + transform + rest;
    }
  }
  return url;
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const search = ((req.query.search as string) || '').trim();
    const limit = Math.min(parsePgInt(req.query.limit, 16) || 16, 50);
    const skip = parsePgInt(req.query.skip, 0) || 0;

    const cacheKey = generateUserListCacheKey(userId, limit, skip, search);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const whereClause: any = {};
    let followingIdsSet = new Set<number>();

    if (userId) {
      const [following, blockers] = await Promise.all([
        prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        }),
        prisma.block.findMany({
          where: { blockedId: userId },
          select: { blockerId: true },
        }),
      ]);

      followingIdsSet = new Set(following.map((f) => f.followingId));
      const blockerIds = blockers.map((b) => b.blockerId);
      const excludedIds = [userId, ...blockerIds];

      if (!search) {
        excludedIds.push(...Array.from(followingIdsSet));
      }

      whereClause.id = { notIn: excludedIds };
    }

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      select: {
        id: true,
        name: true,
        role: true,
        schoolCategory: true,
        avatarUrl: true,
        bio: true,
      },
      orderBy: { id: 'desc' },
    });

    let total = 0;
    if (skip === 0 && users.length < limit) {
      total = users.length;
    } else {
      total = await prisma.user.count({ where: whereClause });
    }

    const formattedUsers = users.map((u) => ({
      ...u,
      avatarUrl: formatCloudinaryAvatar(u.avatarUrl, 160),
      isFollowed: followingIdsSet.has(u.id),
    }));

    const responsePayload = { users: formattedUsers, total };
    await setCache(cacheKey, responsePayload, 300);

    res.json(responsePayload);
  } catch (err: any) {
    if (err?.code === 'P2020') {
      return res.status(400).json({ message: 'Value out of range for integer type' });
    }
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parsePgInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolCategory: true,
        avatarUrl: true,
        bio: true,
        gender: true,
        socialLink: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user?.id;
    if (currentUserId && currentUserId !== userId) {
      const hasBlockedMe = await prisma.block.findUnique({
        where: {
          blockerId_blockedId: { blockerId: userId, blockedId: currentUserId },
        },
      });
      if (hasBlockedMe) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json({
      user: {
        ...user,
        avatarUrl: formatCloudinaryAvatar(user.avatarUrl, 400),
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2020') {
      return res.status(400).json({ message: 'Value out of range for integer type' });
    }
    console.error('Error getting user by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = parsePgInt(req.params.id);

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    await prisma.block.create({
      data: {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
    });

    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: currentUserId, followingId: targetUserId },
          { followerId: targetUserId, followingId: currentUserId },
        ],
      },
    });

    await invalidateUsersCache();

    return res.status(200).json({ message: 'User blocked successfully' });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(400).json({ message: 'User is already blocked' });
    }
    console.error('Error blocking user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = parsePgInt(req.params.id);

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }

    await prisma.block.deleteMany({
      where: {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
    });

    await invalidateUsersCache();

    return res.status(200).json({ message: 'User unblocked successfully' });
  } catch (err) {
    console.error('Error unblocking user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, bio, gender, socialLink, avatarUrl } = req.body;

    let finalAvatarUrl = avatarUrl;
    if (avatarUrl && avatarUrl.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(avatarUrl, {
          folder: 'avatars',
        });
        finalAvatarUrl = uploadRes.secure_url;
      } catch (cErr) {
        console.error('Cloudinary upload error in updateProfile:', cErr);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        ...(name && { name }),
        ...(finalAvatarUrl !== undefined && { avatarUrl: finalAvatarUrl }),
        bio,
        gender,
        socialLink,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolCategory: true,
        avatarUrl: true,
        bio: true,
        gender: true,
        socialLink: true,
        createdAt: true,
      },
    });

    await Promise.all([invalidateUsersCache(), invalidatePostsCache()]);

    return res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
