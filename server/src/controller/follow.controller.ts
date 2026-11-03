import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const followUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const toFollowUserId = parseInt(req.body.toFollowUserId, 10);

    if (!toFollowUserId || isNaN(toFollowUserId)) {
      return res
        .status(400)
        .json({ message: 'Please provide a valid user id to follow' });
    }
    if (userId === toFollowUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const toFollowUser = await prisma.user.findUnique({
      where: { id: toFollowUserId },
    });
    if (!toFollowUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAlreadyFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId!,
          followingId: toFollowUserId,
        },
      },
    });
    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await prisma.follow.create({
      data: {
        followerId: userId!,
        followingId: toFollowUserId,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${toFollowUserId}`).emit('follow_updated', {
        followerId: userId,
        followingId: toFollowUserId,
        isFollowing: true,
      });
      io.to(`user:${userId}`).emit('follow_updated', {
        followerId: userId,
        followingId: toFollowUserId,
        isFollowing: true,
      });
    }

    return res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const toUnfollowUserId = parseInt(req.body.toUnfollowUserId, 10);

    if (!toUnfollowUserId || isNaN(toUnfollowUserId)) {
      return res
        .status(400)
        .json({ message: 'Please provide a valid user id to unfollow' });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId!,
          followingId: toUnfollowUserId,
        },
      },
    });
    if (!follow) {
      return res
        .status(400)
        .json({ message: 'You are not following this user' });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId!,
          followingId: toUnfollowUserId,
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${toUnfollowUserId}`).emit('follow_updated', {
        followerId: userId,
        followingId: toUnfollowUserId,
        isFollowing: false,
      });
      io.to(`user:${userId}`).emit('follow_updated', {
        followerId: userId,
        followingId: toUnfollowUserId,
        isFollowing: false,
      });
    }

    return res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.userId as string);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: targetUserId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            schoolCategory: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      count: followers.length,
      followers: followers.map((f) => f.follower),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.userId as string);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: targetUserId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            schoolCategory: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      count: following.length,
      following: following.map((f) => f.following),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFollowCounts = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.userId as string);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: targetUserId } }),
      prisma.follow.count({ where: { followerId: targetUserId } }),
    ]);

    const currentUserId = req.user?.id;
    let isFollowing = false;
    let isFollowingMe = false;
    let blockedByMe = false;
    let hasBlockedMe = false;

    if (currentUserId) {
      const [followStatus, followMeStatus, myBlock, theirBlock] =
        await Promise.all([
          prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUserId,
              },
            },
          }),
          prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: targetUserId,
                followingId: currentUserId,
              },
            },
          }),
          prisma.block.findUnique({
            where: {
              blockerId_blockedId: {
                blockerId: currentUserId,
                blockedId: targetUserId,
              },
            },
          }),
          prisma.block.findUnique({
            where: {
              blockerId_blockedId: {
                blockerId: targetUserId,
                blockedId: currentUserId,
              },
            },
          }),
        ]);
      isFollowing = !!followStatus;
      isFollowingMe = !!followMeStatus;
      blockedByMe = !!myBlock;
      hasBlockedMe = !!theirBlock;
    }

    return res.status(200).json({
      followersCount,
      followingCount,
      isFollowing,
      isFollowingMe,
      blockedByMe,
      hasBlockedMe,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
