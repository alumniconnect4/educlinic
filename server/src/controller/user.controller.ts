import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  getCache,
  setCache,
  generateUserListCacheKey,
  invalidateUsersCache,
} from '../config/cache.js';
import { parsePgInt } from '../utils/validation.js';

const sanitizeAvatarUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('data:') && url.length > 2000) return null;
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
        email: true,
        role: true,
        schoolCategory: true,
        avatarUrl: true,
        bio: true,
        gender: true,
        socialLink: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let total = 0;
    if (skip === 0 && users.length < limit) {
      total = users.length;
    } else {
      total = await prisma.user.count({ where: whereClause });
    }

    const formattedUsers = users.map((u) => ({
      ...u,
      avatarUrl: sanitizeAvatarUrl(u.avatarUrl),
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
        return res.status(404).json({ message: 'User not found' }); // Hide profile completely
      }
    }

    res.json({
      user: {
        ...user,
        avatarUrl: sanitizeAvatarUrl(user.avatarUrl),
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
    const targetUserId = parseInt(req.params.id as string, 10);

    if (!currentUserId || isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: currentUserId,
          blockedId: targetUserId,
        },
      },
    });

    if (existingBlock) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    await prisma.$transaction([
      prisma.block.create({
        data: { blockerId: currentUserId, blockedId: targetUserId },
      }),
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: currentUserId, followingId: targetUserId },
            { followerId: targetUserId, followingId: currentUserId },
          ],
        },
      }),
    ]);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${currentUserId}`).emit('chat_blocked', {
        blockerId: currentUserId,
        blockedId: targetUserId,
      });
      io.to(`user:${targetUserId}`).emit('chat_blocked', {
        blockerId: currentUserId,
        blockedId: targetUserId,
      });
    }

    await invalidateUsersCache();

    return res.status(200).json({ message: 'User blocked successfully' });
  } catch (err) {
    console.error('Error blocking user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = parseInt(req.params.id as string, 10);

    if (!currentUserId || isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: currentUserId,
          blockedId: targetUserId,
        },
      },
    });

    if (!existingBlock) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: currentUserId,
          blockedId: targetUserId,
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${currentUserId}`).emit('chat_unblocked', {
        blockerId: currentUserId,
        blockedId: targetUserId,
      });
      io.to(`user:${targetUserId}`).emit('chat_unblocked', {
        blockerId: currentUserId,
        blockedId: targetUserId,
      });
    }

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

    const updatedUser = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
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

    await invalidateUsersCache();

    return res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
