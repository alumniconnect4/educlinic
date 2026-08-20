import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/index.js';
import {
  cacheUser,
  getUserFromCache,
  storeSession,
  deleteSession,
  invalidateUsersCache,
} from '../config/cache.js';
import type { User } from '../../generated/prisma/browser.js';
import { prisma } from '../config/db.js';
import { DEFAULT_AVATAR_URL, isBase64Image } from '../utils/constants.js';
import { enqueueUserImageUpload } from '../services/queue.service.js';

export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      schoolCategory,
      avatarUrl,
      idCardUrl,
      degreeUrl,
    } = req.body;

    if (!name || !email || !password || !role || !schoolCategory) {
      return res.status(400).json({ message: 'All text fields are required' });
    }

    if (role === 'USER' && !idCardUrl) {
      return res.status(400).json({
        message: 'ID Card upload is required for Student registration.',
      });
    }

    if (role === 'ALUMNI' && !idCardUrl && !degreeUrl) {
      return res.status(400).json({
        message:
          'Alumni registration requires either an ID Card or Degree Certificate upload.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAvatarBase64 = isBase64Image(avatarUrl);
    const isIdCardBase64 = isBase64Image(idCardUrl);
    const isDegreeBase64 = isBase64Image(degreeUrl);

    const initialAvatarUrl = isAvatarBase64
      ? DEFAULT_AVATAR_URL
      : avatarUrl?.trim() || DEFAULT_AVATAR_URL;

    const initialIdCardUrl = isIdCardBase64 ? null : idCardUrl || null;
    const initialDegreeUrl = isDegreeBase64 ? null : degreeUrl || null;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        schoolCategory,
        avatarUrl: initialAvatarUrl,
        idCardUrl: initialIdCardUrl,
        degreeUrl: initialDegreeUrl,
      },
    });

    // Enqueue background uploads to Cloudinary for any base64 images
    if (isAvatarBase64) {
      await enqueueUserImageUpload(
        newUser.id,
        avatarUrl,
        'avatarUrl',
        'avatars'
      );
    }
    if (isIdCardBase64) {
      await enqueueUserImageUpload(
        newUser.id,
        idCardUrl,
        'idCardUrl',
        'id_cards'
      );
    }
    if (isDegreeBase64) {
      await enqueueUserImageUpload(
        newUser.id,
        degreeUrl,
        'degreeUrl',
        'degrees'
      );
    }

    await invalidateUsersCache();

    if (newUser.role === 'USER' || newUser.role === 'ALUMNI') {
      return res.status(201).json({
        message:
          'Registration request submitted successfully! Your account is pending administrator review and approval before you can log in.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          schoolCategory: newUser.schoolCategory,
          avatarUrl: newUser.avatarUrl,
          isVerified: false,
        },
      });
    }

    const sessionId = crypto.randomUUID();
    await storeSession(sessionId, { id: newUser.id, role: newUser.role });
    res.cookie('sessionId', sessionId, { ...config.cookieOptions });

    res.json({
      message: 'User registered successfully',
      sessionId,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        schoolCategory: newUser.schoolCategory,
        avatarUrl: newUser.avatarUrl,
        isVerified: true,
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

    if (!user.isVerified && (user.role === 'USER' || user.role === 'ALUMNI')) {
      // Re-verify against database in case cache was stale when admin approved user
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser && dbUser.isVerified) {
        user = dbUser;
        await cacheUser(user);
      }
    }

    if (!user.isVerified && (user.role === 'USER' || user.role === 'ALUMNI')) {
      return res.status(403).json({
        message:
          'Your registration request is pending admin approval. Please wait for an administrator to review and approve your account.',
      });
    }

    const sessionId = crypto.randomUUID();
    await storeSession(sessionId, { id: user.id, role: user.role });
    res.cookie('sessionId', sessionId, { ...config.cookieOptions });

    res.json({
      message: 'User logged in successfully',
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolCategory: user.schoolCategory,
        avatarUrl: user.avatarUrl || DEFAULT_AVATAR_URL,
        isDeveloper: user.isDeveloper,
        developerTitle: user.developerTitle,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await deleteSession(sessionId);
    }
    res.clearCookie('sessionId', config.cookieOptions);
    res.clearCookie('token', config.cookieOptions);
    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
