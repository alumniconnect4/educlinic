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
      const authHeader = req.headers.authorization;
      const rawBearer = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : undefined;
      const bearerToken =
        rawBearer &&
        rawBearer !== 'undefined' &&
        rawBearer !== 'null' &&
        rawBearer !== '[object Object]'
          ? rawBearer
          : undefined;

      const cookieSessionId = req.cookies?.sessionId;
      const cookieToken = req.cookies?.token;

      const isJwt = (t?: string) =>
        typeof t === 'string' && t.split('.').length === 3;

      const sessionId =
        cookieSessionId || (!isJwt(bearerToken) ? bearerToken : undefined);
      const token =
        cookieToken || (isJwt(bearerToken) ? bearerToken : undefined);

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
          // Expected auth failure for invalid/expired JWT tokens
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
          isDeveloper: true,
          developerTitle: true,
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
