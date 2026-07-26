import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { env } from "../config/env.js";
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


export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "unauthorized" })
        }
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: number, role: string };
        if (!decoded) {
            return res.status(401).json({ message: "unauthorized" })
        }
        req.user = decoded as AuthenticatedUser;
        next();
    } catch (err) {
        console.error("JWT Verification failed:", err);
        return res.status(401).json({ message: "unauthorized" })
    }
}