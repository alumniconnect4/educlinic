import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getSession } from '../config/cache.js';
import { prisma } from '../config/db.js';
import type { User } from '../../generated/prisma/browser.js';

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
  | 'isDeveloper'
  | 'developerTitle'
  | 'createdAt'
>;

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const token = cookieToken || (isJwt(bearerToken) ? bearerToken : undefined);
    const sessionId =
      cookieSessionId || (!isJwt(bearerToken) ? bearerToken : undefined);

    let userId: number | undefined;

    if (sessionId) {
      const session = await getSession(sessionId);
      if (session && session.id) {
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
      } catch (err) {
        // Expected auth failure for invalid/expired JWT
      }
    }

    if (!userId) {
      res.status(401).json({ message: 'unauthorized' });
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
        bio: true,
        gender: true,
        socialLink: true,
        isDeveloper: true,
        developerTitle: true,
        createdAt: true,
      },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }

    req.user = user as AuthenticatedUser;
    next();
  } catch (err) {
    console.error('Auth Verification failed:', err);
    res.status(401).json({ message: 'unauthorized' });
    return;
  }
};
