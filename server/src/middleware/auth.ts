import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { getSession } from '../config/cache.js';
import type { User } from '../../generated/prisma/browser.js';
import {
  UserRole,
  type UserRole as UserRoleEnum,
} from '../../generated/prisma/enums.js';

type AuthenticatedUser = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'role'
  | 'schoolCategory'
  | 'bio'
  | 'gender'
  | 'socialLink'
  | 'createdAt'
> & {
  avatarUrl?: string | null;
};

const roleRank: Record<UserRoleEnum, number> = {
  [UserRole.USER]: 0,
  [UserRole.ALUMNI]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authMiddleware =
  (requiredRole?: UserRoleEnum) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookieSessionId = req.cookies?.sessionId;
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

      const sessionId = cookieSessionId || bearerToken;
      const token = req.cookies?.token || bearerToken;

      let userId: number | undefined;

      if (sessionId) {
        const session = await getSession(sessionId);
        if (session) {
          userId = session.id;
        }
      }

      if (!userId && token) {
        try {
          const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
            id: number;
            role: string;
          };
          if (decoded && decoded.id) {
            userId = decoded.id;
          }
        } catch (jwtErr) {
          console.error('JWT verify failed in authMiddleware:', jwtErr);
        }
      }

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (
        requiredRole &&
        roleRank[user.role as UserRoleEnum] < roleRank[requiredRole]
      ) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
