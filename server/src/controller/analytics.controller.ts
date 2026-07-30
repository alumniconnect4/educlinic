import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const usersCount = await prisma.user.count({
      where: { role: 'USER', isVerified: true },
    });
    const alumniCount = await prisma.user.count({
      where: { role: 'ALUMNI', isVerified: true },
    });
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN', isVerified: true },
    });

    // Also fetch total for convenience (verified users only)
    const total = usersCount + alumniCount + adminCount;

    return res.status(200).json({
      users: usersCount,
      alumni: alumniCount,
      admins: adminCount,
      total,
    });
  } catch (err) {
    console.error('Error in getOverviewStats:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoleSchoolStats = async (req: Request, res: Response) => {
  try {
    const { role } = req.params; // Expect 'USER', 'ALUMNI', or 'ADMIN'

    // Prisma groupBy query
    const distribution = await prisma.user.groupBy({
      by: ['schoolCategory'],
      where: {
        role: String(role).toUpperCase() as any,
        isVerified: true,
      },
      _count: {
        _all: true,
      },
    });

    const allSchoolsMap: Record<string, number> = {
      School_of_Engineering: 0,
      School_of_Sciences: 0,
      School_of_Agriculture: 0,
      School_of_Business_Studies: 0,
      School_of_Computer_Applications: 0,
      School_of_Humanities: 0,
      School_of_Education: 0,
      School_of_Law: 0,
      School_of_Pharmacy: 0,
      'Not Specified': 0,
    };

    // Populate with actual data
    distribution.forEach((item) => {
      const key = item.schoolCategory ? item.schoolCategory : 'Not Specified';
      if (key in allSchoolsMap) {
        allSchoolsMap[key] = item._count._all;
      }
    });

    // Format data for Recharts: [{ name: "School of Engineering", value: 120 }, ...]
    const formattedData = Object.entries(allSchoolsMap).map(([key, value]) => ({
      name: key.replace(/_/g, ' '),
      value: value,
    }));

    return res.status(200).json(formattedData);
  } catch (err) {
    console.error('Error in getRoleSchoolStats:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecentEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        eventType: true,
        startDate: true,
        endDate: true,
        organizedBy: true,
      },
    });
    return res.status(200).json(events);
  } catch (err) {
    console.error('Error in getRecentEvents:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCommunityStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPosts = await prisma.post.count();

    const postsThisMonth = await prisma.post.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const studentPosts = await prisma.post.count({
      where: {
        createdBy: {
          role: 'USER',
        },
      },
    });

    const alumniPosts = await prisma.post.count({
      where: {
        createdBy: {
          role: 'ALUMNI',
        },
      },
    });

    const commentsThisMonth = await prisma.comment.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return res.status(200).json({
      totalPosts,
      postsThisMonth,
      studentPosts,
      alumniPosts,
      commentsThisMonth,
    });
  } catch (err) {
    console.error('Error in getCommunityStats:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHelpTicketStats = async (req: Request, res: Response) => {
  try {
    const latestTickets = await prisma.helpTicket.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, role: true, email: true },
        },
      },
    });

    const totalCount = await prisma.helpTicket.count();

    return res.status(200).json({
      latestTickets,
      totalCount,
    });
  } catch (err) {
    console.error('Error in getHelpTicketStats:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserRegistrationAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    // Per-role breakdown — verified users only (pending approval excluded)
    const roles = ['USER', 'ALUMNI', 'ADMIN', 'SUPER_ADMIN'] as const;

    const roleStats = await Promise.all(
      roles.map(async (role) => {
        const total = await prisma.user.count({
          where: { role, isVerified: true },
        });
        return { role, total };
      })
    );

    const totalVerifiedUsers = roleStats.reduce((sum, r) => sum + r.total, 0);

    // Monthly registrations trend (last 6 months — verified users only)
    const now = new Date();
    const monthlyTrend = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const monthDate = new Date(
          now.getFullYear(),
          now.getMonth() - (5 - i),
          1
        );
        const nextMonth = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          1
        );
        const count = await prisma.user.count({
          where: {
            isVerified: true,
            createdAt: {
              gte: monthDate,
              lt: nextMonth,
            },
          },
        });
        return {
          month: monthDate.toLocaleString('default', {
            month: 'short',
            year: '2-digit',
          }),
          count,
        };
      })
    );

    return res.status(200).json({
      totalVerifiedUsers,
      roleStats,
      monthlyTrend,
    });
  } catch (err) {
    console.error('Error in getUserRegistrationAnalytics:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
