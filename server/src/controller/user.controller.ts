import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const search = (req.query.search as string) || '';
    const limit = parseInt(req.query.limit as string) || 16;
    const skip = parseInt(req.query.skip as string) || 0;

    const whereClause: any = {};

    if (userId) {
      let followingIds: number[] = [];
      if (!search) {
        const following = await prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });
        followingIds = following.map((f) => f.followingId);
      }

      const blockers = await prisma.block.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      });
      const blockerIds = blockers.map((b) => b.blockerId);

      whereClause.id = { notIn: [userId, ...followingIds, ...blockerIds] };
    }

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          schoolCategory: true,
          bio: true,
          gender: true,
          socialLink: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    let followingIds = new Set<number>();
    if (userId) {
      const following = await prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: users.map((u) => u.id) },
        },
      });
      followingIds = new Set(following.map((f) => f.followingId));
    }

    const formattedUsers = users.map((u) => ({
      ...u,
      isFollowed: followingIds.has(u.id),
    }));

    res.json({ users: formattedUsers, total });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    if (isNaN(userId)) {
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

    res.json({ user });
  } catch (err) {
    console.log(err);
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

    const { name, bio, gender, socialLink } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        ...(name && { name }),
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
        bio: true,
        gender: true,
        socialLink: true,
        createdAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
