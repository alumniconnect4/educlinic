import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.js';
import { config } from '../config/index.js';
import { cacheUser, getUserFromCache } from '../config/cache.js';
import type { User } from '../../generated/prisma/browser.js';
import { prisma } from '../config/db.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, schoolCategory } = req.body;

    if (!name || !email || !password || !role || !schoolCategory) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        schoolCategory,
      },
    });

    const token = await generateToken({ id: newUser.id, role: newUser.role });
    res.cookie('token', token!, { ...config.cookieOptions });

    res.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        schoolCategory: newUser.schoolCategory,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user: User | null = await getUserFromCache(email);

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        await cacheUser(user);
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'Credentials mismatch' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credentials mismatch' });
    }

    const token = await generateToken({ id: user.id, role: user.role });
    res.cookie('token', token!, { ...config.cookieOptions });

    res.json({
      message: 'User logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolCategory: user.schoolCategory,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
