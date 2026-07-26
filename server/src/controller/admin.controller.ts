import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import { config } from "../config/index.js";


export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(400).json({ message: "Credentials doesn't match" })
        }

        if (user.role != "SUPER_ADMIN" && user.role != "ADMIN") {
            return res.status(400).json({ message: "You are not authorized to perform this action" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Credentials doesn't match" })
        }

        const token = generateToken({ id: user.id, role: user.role });

        res.cookie("token", token, {
            ...config.cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        })

        return res.status(200).json({ 
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        res.json({ message: 'User logged out successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};