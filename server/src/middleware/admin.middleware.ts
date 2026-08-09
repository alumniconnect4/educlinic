import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getSession } from '../config/cache.js';
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

    const token =
      cookieToken || (isJwt(bearerToken) ? bearerToken : undefined);
    const sessionId =
      cookieSessionId || (!isJwt(bearerToken) ? bearerToken : undefined);

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
          id: number;
          role: string;
        };
        if (
          decoded &&
          (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN')
        ) {
          req.user = decoded as AuthenticatedUser;
          next();
          return;
        }
      } catch (err) {
        // Expected auth failure for invalid/expired JWT
      }
    }

    if (sessionId) {
      const session = await getSession(sessionId);
      if (
        session &&
        (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN')
      ) {
        req.user = session as AuthenticatedUser;
        next();
        return;
      }
    }

    res.status(401).json({ message: 'unauthorized' });
    return;
  } catch (err) {
    console.error('Auth Verification failed:', err);
    res.status(401).json({ message: 'unauthorized' });
    return;
  }
};
