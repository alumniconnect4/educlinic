import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  EventType,
  EventVisibility,
  UserRole,
  type UserRole as UserRoleEnum,
} from '../../generated/prisma/enums.js';
import cloudinary from '../config/cloudinary.js';

const validEventTypes = new Set<string>(Object.values(EventType));
const validEventVisibilities = new Set<string>(Object.values(EventVisibility));
const roleRank: Record<UserRoleEnum, number> = {
  [UserRole.USER]: 0,
  [UserRole.ALUMNI]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

const parseDate = (value: unknown) => {
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const canManageEvent = (
  actor: { id: number; role: UserRoleEnum },
  owner: { id: number; role: UserRoleEnum }
) => actor.id === owner.id || roleRank[actor.role] > roleRank[owner.role];

const canModifyEvent = (
  userId: number,
  userRole: UserRoleEnum,
  event: { createdById: number; permissionMode: string; permittedAdminIds: number[] }
) => {
  if (userRole === UserRole.SUPER_ADMIN) return true;
  if (event.createdById === userId) return true;
  if (event.permissionMode === 'HYBRID' && event.permittedAdminIds.includes(userId)) {
    return true;
  }
  return false;
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log(req.user);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      name,
      description,
      organizedBy,
      imageUrl,
      place,
      eventType,
      visibility,
      startDate,
      endDate,
      permissionMode,
      permittedAdminIds,
    } = req.body;

    if (
      !name ||
      !organizedBy ||
      !place ||
      !eventType ||
      !visibility ||
      !startDate ||
      !endDate
    ) {
      return res
        .status(400)
        .json({ message: 'All required fields must be provided' });
    }

    if (!validEventTypes.has(eventType)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    if (!validEventVisibilities.has(visibility)) {
      return res.status(400).json({ message: 'Invalid event visibility' });
    }

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({ message: 'Invalid startDate or endDate' });
    }

    if (parsedEndDate <= parsedStartDate) {
      return res
        .status(400)
        .json({ message: 'endDate must be after startDate' });
    }

    let finalImageUrl = undefined;
    if (imageUrl) {
      try {
        const cloudinaryUpload = await cloudinary.uploader.upload(imageUrl, {
          folder: 'events',
        });
        finalImageUrl = cloudinaryUpload.secure_url;
      } catch (error) {
        console.error('Cloudinary upload failed, falling back to original URL/base64:', error);
        finalImageUrl = imageUrl;
      }
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description ?? null,
        organizedBy,
        place,
        eventType,
        visibility,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        createdById: req.user.id,
        permissionMode: permissionMode ?? "NONE",
        permittedAdminIds: permittedAdminIds ? permittedAdminIds.map(Number) : [],
        ...(finalImageUrl && { imageUrl: finalImageUrl }),
      },
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json({ event });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const { limit, offset } = _req.params;
    const { filter, createdById } = _req.query;

    const take = limit ? parseInt(limit as string, 10) : 8;
    const skip = offset ? parseInt(offset as string, 10) : 0;

    const now = new Date();
    const where: any =
      filter === 'upcoming'
        ? { startDate: { gte: now } }
        : filter === 'past'
          ? { endDate: { lt: now } }
          : filter === 'current'
            ? { startDate: { lte: now }, endDate: { gte: now } }
            : {};

    if (createdById) {
      where.createdById = Number(createdById);
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        take,
        skip,
        orderBy: {
          startDate: filter === 'past' ? 'desc' : 'asc',
        },
      }),
      prisma.event.count({ where }),
    ]);

    return res.json({ events, total });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!canModifyEvent(req.user.id, req.user.role, existingEvent)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      name,
      description,
      organizedBy,
      imageUrl,
      place,
      eventType,
      visibility,
      startDate,
      endDate,
      permissionMode,
      permittedAdminIds,
    } = req.body;

    const parsedStartDate =
      startDate !== undefined ? parseDate(startDate) : undefined;
    const parsedEndDate =
      endDate !== undefined ? parseDate(endDate) : undefined;

    if (startDate !== undefined && !parsedStartDate) {
      return res.status(400).json({ message: 'Invalid startDate' });
    }

    if (endDate !== undefined && !parsedEndDate) {
      return res.status(400).json({ message: 'Invalid endDate' });
    }

    if (eventType !== undefined && !validEventTypes.has(eventType)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    if (visibility !== undefined && !validEventVisibilities.has(visibility)) {
      return res.status(400).json({ message: 'Invalid event visibility' });
    }

    const nextStartDate = parsedStartDate ?? existingEvent.startDate;
    const nextEndDate = parsedEndDate ?? existingEvent.endDate;

    if (nextEndDate <= nextStartDate) {
      return res
        .status(400)
        .json({ message: 'endDate must be after startDate' });
    }

    let finalImageUrl = undefined;
    if (imageUrl !== undefined) {
      if (imageUrl) {
        try {
          const cloudinaryUpload = await cloudinary.uploader.upload(imageUrl, {
            folder: 'events',
          });
          finalImageUrl = cloudinaryUpload.secure_url;
        } catch (error) {
          console.error('Cloudinary upload failed in update, falling back to original URL/base64:', error);
          finalImageUrl = imageUrl;
        }
      } else {
        finalImageUrl = null;
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(organizedBy !== undefined ? { organizedBy } : {}),
        ...(place !== undefined ? { place } : {}),
        ...(eventType !== undefined ? { eventType } : {}),
        ...(visibility !== undefined ? { visibility } : {}),
        ...(parsedStartDate ? { startDate: parsedStartDate } : {}),
        ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
        ...(finalImageUrl !== undefined ? { imageUrl: finalImageUrl } : {}),
        ...(permissionMode !== undefined ? { permissionMode } : {}),
        ...(permittedAdminIds !== undefined ? { permittedAdminIds: permittedAdminIds.map(Number) } : {}),
      },
    });

    return res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!canModifyEvent(req.user.id, req.user.role, existingEvent)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.event.delete({
      where: { id },
    });

    return res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const registerEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const eventId = Number(id);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const {
      name,
      email,
      countryCode,
      contactNo,
      companyOrCollege,
      graduationYear,
      linkedInUrl,
    } = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: 'You are already registered for this event' });
    }

    const newRegistration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        name,
        email,
        countryCode,
        contactNo,
        companyOrCollege,
        graduationYear,
        linkedInUrl,
      },
    });

    return res.status(201).json({
      message: 'Successfully registered for the event',
      registration: newRegistration,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ registrations });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

