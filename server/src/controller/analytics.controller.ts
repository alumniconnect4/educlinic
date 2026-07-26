import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

export const getOverviewStats = async (req: Request, res: Response) => {
    try {
        const usersCount = await prisma.user.count({ where: { role: "USER" } });
        const alumniCount = await prisma.user.count({ where: { role: "ALUMNI" } });
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

        // Also fetch total for convenience
        const total = usersCount + alumniCount + adminCount;

        return res.status(200).json({
            users: usersCount,
            alumni: alumniCount,
            admins: adminCount,
            total
        });
    } catch (err) {
        console.error("Error in getOverviewStats:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getRoleSchoolStats = async (req: Request, res: Response) => {
    try {
        const { role } = req.params; // Expect 'USER', 'ALUMNI', or 'ADMIN'

        // Prisma groupBy query
        const distribution = await prisma.user.groupBy({
            by: ['schoolCategory'],
            where: {
                role: String(role).toUpperCase() as any
            },
            _count: {
                _all: true
            }
        });

        // Format data for Recharts: [{ name: "School of Engineering", value: 120 }, ...]
        const formattedData = distribution.map(item => ({
            name: item.schoolCategory ? item.schoolCategory.replace(/_/g, ' ') : "Not Specified",
            value: item._count._all
        }));

        return res.status(200).json(formattedData);
    } catch (err) {
        console.error("Error in getRoleSchoolStats:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getRecentEvents = async (req: Request, res: Response) => {
    try {
        const events = await prisma.event.findMany({
            take: 3,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                eventType: true,
                startDate: true,
                endDate: true,
                organizedBy: true
            }
        });
        return res.status(200).json(events);
    } catch (err) {
        console.error("Error in getRecentEvents:", err);
        return res.status(500).json({ message: "Internal server error" });
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
                    gte: startOfMonth
                }
            }
        });

        const studentPosts = await prisma.post.count({
            where: {
                createdBy: {
                    role: "USER"
                }
            }
        });

        const alumniPosts = await prisma.post.count({
            where: {
                createdBy: {
                    role: "ALUMNI"
                }
            }
        });

        const commentsThisMonth = await prisma.comment.count({
            where: {
                createdAt: {
                    gte: startOfMonth
                }
            }
        });

        return res.status(200).json({
            totalPosts,
            postsThisMonth,
            studentPosts,
            alumniPosts,
            commentsThisMonth
        });
    } catch (err) {
        console.error("Error in getCommunityStats:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getHelpTicketStats = async (req: Request, res: Response) => {
    try {
        const latestTickets = await prisma.helpTicket.findMany({
            where: { status: 'OPEN' },
            take: 2,
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { name: true, role: true }
                }
            }
        });

        const unresolvedCount = await prisma.helpTicket.count({
            where: { status: 'OPEN' }
        });

        const resolvedCount = await prisma.helpTicket.count({
            where: { status: 'RESOLVED' }
        });

        return res.status(200).json({
            latestTickets,
            unresolvedCount,
            resolvedCount
        });
    } catch (err) {
        console.error("Error in getHelpTicketStats:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
