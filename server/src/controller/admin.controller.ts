import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.js';
import { config } from '../config/index.js';
import cloudinary from '../config/cloudinary.js';
import {
  deleteUserCache,
  deleteSession,
  getCache,
  setCache,
  generateAdminUserListCacheKey,
  invalidateUsersCache,
} from '../config/cache.js';


export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Credentials doesn't match" });
    }

    if (user.role != 'SUPER_ADMIN' && user.role != 'ADMIN') {
      return res
        .status(400)
        .json({ message: 'You are not authorized to perform this action' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credentials doesn't match" });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      ...config.cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await deleteSession(sessionId);
    }
    res.clearCookie('token', config.cookieOptions);
    res.clearCookie('sessionId', config.cookieOptions);
    res.json({ message: 'User logged out successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ message: 'Forbidden: Only Super Admin can view all admins' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const cacheKey = generateAdminUserListCacheKey('admins', page, limit, undefined, search);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // @ts-ignore - Prisma mode typing
    const whereClause: any = {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
      ...(search
        ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
        : {}),
    };

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const responsePayload = {
      data: admins,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    await setCache(cacheKey, responsePayload, 300);

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;

export const createAdmin = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ message: 'Forbidden: Only Super Admin can create admins' });
    }

    const {
      name,
      email,
      password,
      role,
      schoolCategory,
      avatarUrl,
      bio,
      gender,
      socialLink,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalAvatarUrl =
      avatarUrl && avatarUrl.trim() !== ''
        ? avatarUrl.trim()
        : DEFAULT_USER_AVATAR;

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: true,
        avatarUrl: finalAvatarUrl,
        ...(schoolCategory ? { schoolCategory } : {}),
        ...(bio ? { bio } : {}),
        ...(gender ? { gender } : {}),
        ...(socialLink ? { socialLink } : {}),
      },
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await invalidateUsersCache();

    return res
      .status(201)
      .json({ message: 'Admin created successfully', user: newAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ message: 'Forbidden: Only Super Admin can update admins' });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Admin ID' });
    }

    const {
      name,
      email,
      password,
      role,
      schoolCategory,
      avatarUrl,
      bio,
      gender,
      socialLink,
      isVerified,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role && (role === 'ADMIN' || role === 'SUPER_ADMIN'))
      updateData.role = role;
    if (schoolCategory !== undefined)
      updateData.schoolCategory = schoolCategory || null;
    if (avatarUrl !== undefined) {
      updateData.avatarUrl =
        avatarUrl.trim() !== '' ? avatarUrl.trim() : DEFAULT_USER_AVATAR;
    }
    if (bio !== undefined) updateData.bio = bio || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (socialLink !== undefined) updateData.socialLink = socialLink || null;
    // Only SUPER_ADMIN reaches here; allow explicit isVerified override.
    // If not passed, admins remain verified by default.
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified);
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    await deleteUserCache(updatedAdmin.email);
    await invalidateUsersCache();

    return res
      .status(200)
      .json({ message: 'Admin updated successfully', user: updatedAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ message: 'Forbidden: Only Super Admin can delete admins' });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Admin ID' });
    }

    if (req.user?.id === id) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    await prisma.user.delete({
      where: { id },
    });

    if (user?.email) {
      await deleteUserCache(user.email);
    }
    await invalidateUsersCache();

    return res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ==================== ALUMNI & STUDENTS MANAGEMENT ==================== //

export const getAlumniStudents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = (req.query.search as string) || '';
    const roleFilter = (req.query.role as string) || 'ALL';

    const skip = (page - 1) * limit;

    const cacheKey = generateAdminUserListCacheKey('alumnistudents', page, limit, roleFilter, search);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const roleCondition =
      roleFilter === 'USER'
        ? ['USER']
        : roleFilter === 'ALUMNI'
          ? ['ALUMNI']
          : ['USER', 'ALUMNI'];

    const whereClause: any = {
      role: { in: roleCondition },
      isVerified: true,
      ...(search
        ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          schoolCategory: true,
          avatarUrl: true,
          idCardUrl: true,
          degreeUrl: true,
          bio: true,
          gender: true,
          socialLink: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const responsePayload = {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    await setCache(cacheKey, responsePayload, 300);

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAlumniStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, schoolCategory, avatarUrl } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'All required fields must be provided' });
    }

    if (role !== 'USER' && role !== 'ALUMNI') {
      return res
        .status(400)
        .json({ message: 'Role must be Student (USER) or Alumni (ALUMNI)' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalAvatarUrl =
      avatarUrl && avatarUrl.trim() !== ''
        ? avatarUrl.trim()
        : DEFAULT_USER_AVATAR;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: true, // Admin created accounts are pre-approved
        avatarUrl: finalAvatarUrl,
        ...(schoolCategory ? { schoolCategory } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolCategory: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
      },
    });

    await invalidateUsersCache();

    return res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAlumniStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const {
      name,
      email,
      password,
      role,
      schoolCategory,
      avatarUrl,
      idCardUrl,
      degreeUrl,
      bio,
      gender,
      socialLink,
      isVerified,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role && (role === 'USER' || role === 'ALUMNI')) updateData.role = role;
    if (schoolCategory !== undefined)
      updateData.schoolCategory = schoolCategory || null;
    if (avatarUrl !== undefined) {
      updateData.avatarUrl =
        avatarUrl.trim() !== '' ? avatarUrl.trim() : DEFAULT_USER_AVATAR;
    }
    if (idCardUrl !== undefined) updateData.idCardUrl = idCardUrl || null;
    if (degreeUrl !== undefined) updateData.degreeUrl = degreeUrl || null;
    if (bio !== undefined) updateData.bio = bio || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (socialLink !== undefined) updateData.socialLink = socialLink || null;
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified);

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolCategory: true,
        avatarUrl: true,
        idCardUrl: true,
        degreeUrl: true,
        bio: true,
        gender: true,
        socialLink: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await deleteUserCache(updatedUser.email);
    await invalidateUsersCache();

    return res
      .status(200)
      .json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAlumniStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    await prisma.user.delete({
      where: { id },
    });

    if (user?.email) {
      await deleteUserCache(user.email);
    }
    await invalidateUsersCache();

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ==================== PENDING REGISTRATION REQUESTS ==================== //

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = (req.query.search as string) || '';
    const roleFilter = (req.query.role as string) || 'ALL';

    const skip = (page - 1) * limit;

    const cacheKey = generateAdminUserListCacheKey('pending', page, limit, roleFilter, search);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const roleCondition =
      roleFilter === 'USER'
        ? ['USER']
        : roleFilter === 'ALUMNI'
          ? ['ALUMNI']
          : ['USER', 'ALUMNI'];

    const whereClause: any = {
      isVerified: false,
      role: { in: roleCondition },
      ...(search
        ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
        : {}),
    };

    const [pendingUsers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          schoolCategory: true,
          avatarUrl: true,
          idCardUrl: true,
          degreeUrl: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const responsePayload = {
      data: pendingUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    await setCache(cacheKey, responsePayload, 300);

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const approvePendingRequest = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Request ID' });
    }

    const approvedUser = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolCategory: true,
        isVerified: true,
      },
    });

    await deleteUserCache(approvedUser.email);
    await invalidateUsersCache();

    return res
      .status(200)
      .json({ message: 'Registration request approved', user: approvedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const declinePendingRequest = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid Request ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    await prisma.user.delete({
      where: { id },
    });

    if (user?.email) {
      await deleteUserCache(user.email);
    }
    await invalidateUsersCache();

    return res.status(200).json({ message: 'Registration request declined' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, email, avatarUrl, bio, gender, socialLink } = req.body;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    if (gender !== undefined) updateData.gender = gender;
    if (socialLink !== undefined) updateData.socialLink = socialLink;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await deleteUserCache(updatedUser.email);

    await deleteUserCache(updatedUser.email);

    return res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const changeAdminPassword = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    await deleteUserCache(user.email);

    await deleteUserCache(user.email);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadAdminImage = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    try {
      const cloudinaryUpload = await cloudinary.uploader.upload(image, {
        folder: 'admin_avatars',
      });
      return res.status(200).json({ url: cloudinaryUpload.secure_url });
    } catch (cloudinaryErr) {
      console.warn(
        'Cloudinary upload failed, falling back to base64 URL storage:',
        cloudinaryErr
      );
      // Return base64 directly so that the frontend works even with dummy Cloudinary credentials
      return res.status(200).json({
        url: image,
        warning: 'Cloudinary upload failed, fell back to base64 storage',
      });
    }
  } catch (err) {
    console.error('General admin upload error:', err);
    return res.status(500).json({ message: 'Image upload failed' });
  }
};
