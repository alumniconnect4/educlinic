import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  EventType,
  EventVisibility,
  UserRole,
  type UserRole as UserRoleEnum,
} from '../../generated/prisma/enums.js';
import cloudinary from '../config/cloudinary.js';
import {
  getCache,
  setCache,
  generateEventListCacheKey,
  generateEventDetailCacheKey,
  invalidateEventsCache,
} from '../config/cache.js';

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
  event: {
    createdById: number;
    permissionMode?: string | null;
    permittedAdminIds?: number[] | null;
  }
) => {
  if (userRole === UserRole.SUPER_ADMIN) return true;
  if (event.createdById === userId) return true;
  if (
    event.permissionMode === 'HYBRID' &&
    Array.isArray(event.permittedAdminIds) &&
    event.permittedAdminIds.includes(userId)
  ) {
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
      registrationLimit,
      startRegistrationsNow,
    } = req.body;

    const eventVisibility = visibility || 'GLOBAL';

    if (
      !name ||
      !organizedBy ||
      !place ||
      !eventType ||
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

    if (!validEventVisibilities.has(eventVisibility)) {
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
        return res.status(500).json({ message: 'Image upload failed', error });
      }
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description ?? null,
        organizedBy,
        place,
        eventType,
        visibility: eventVisibility,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        registrationLimit:
          registrationLimit !== undefined &&
          registrationLimit !== '' &&
          registrationLimit !== null
            ? Number(registrationLimit)
            : null,
        startRegistrationsNow:
          startRegistrationsNow !== undefined
            ? Boolean(startRegistrationsNow)
            : true,
        createdById: req.user.id,
        ...(finalImageUrl && { imageUrl: finalImageUrl }),
      },
    });

    await invalidateEventsCache();

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

    const cacheKey = generateEventDetailCacheKey(id);
    const cachedData = await getCache<{ event: any }>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const verifiedRegistrationsCount = await prisma.registration.count({
      where: { eventId: id, user: { isVerified: true } },
    });

    const responsePayload = { event: { ...event, verifiedRegistrationsCount } };
    await setCache(cacheKey, responsePayload);

    return res.json(responsePayload);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const { limit, offset } = _req.params;
    const { filter } = _req.query;
    const searchString = (
      typeof _req.query.search === 'string'
        ? _req.query.search
        : typeof _req.query.q === 'string'
          ? _req.query.q
          : ''
    ).trim();

    const take = limit ? parseInt(limit as string, 10) : 8;
    const skip = offset ? parseInt(offset as string, 10) : 0;

    const cacheKey = generateEventListCacheKey(
      take,
      skip,
      filter as string | undefined,
      searchString
    );
    const cachedData = await getCache<{ events: any[]; total: number }>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const now = new Date();
    const where: any =
      filter === 'upcoming'
        ? { startDate: { gte: now } }
        : filter === 'past'
          ? { startDate: { lt: now } }
          : {};

    if (searchString) {
      where.OR = [
        { name: { contains: searchString, mode: 'insensitive' } },
        { place: { contains: searchString, mode: 'insensitive' } },
        { organizedBy: { contains: searchString, mode: 'insensitive' } },
        { description: { contains: searchString, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Get verified-user registration counts for each event
    const eventIds = events.map((e) => e.id);
    const verifiedCounts = await prisma.registration.findMany({
      where: {
        eventId: { in: eventIds },
        user: { isVerified: true },
      },
      select: { eventId: true },
    });
    const verifiedCountMap: Record<number, number> = {};
    for (const r of verifiedCounts) {
      verifiedCountMap[r.eventId] = (verifiedCountMap[r.eventId] || 0) + 1;
    }

    const eventsWithVerified = events.map((e) => ({
      ...e,
      verifiedRegistrationsCount: verifiedCountMap[e.id] ?? 0,
    }));

    const responsePayload = { events: eventsWithVerified, total };
    await setCache(cacheKey, responsePayload);

    return res.json(responsePayload);
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

    if (!canManageEvent(req.user, existingEvent.createdBy)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      name,
      description,
      organizedBy,
      place,
      eventType,
      visibility,
      startDate,
      endDate,
      imageUrl,
      registrationLimit,
      startRegistrationsNow,
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
      if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
        try {
          const cloudinaryUpload = await cloudinary.uploader.upload(imageUrl, {
            folder: 'events',
          });
          finalImageUrl = cloudinaryUpload.secure_url;
        } catch (error) {
          return res
            .status(500)
            .json({ message: 'Image upload failed', error });
        }
      } else if (typeof imageUrl === 'string') {
        finalImageUrl = imageUrl;
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
        ...(registrationLimit !== undefined
          ? {
              registrationLimit:
                registrationLimit !== '' && registrationLimit !== null
                  ? Number(registrationLimit)
                  : null,
            }
          : {}),
        ...(startRegistrationsNow !== undefined
          ? { startRegistrationsNow: Boolean(startRegistrationsNow) }
          : {}),
        ...(finalImageUrl !== undefined ? { imageUrl: finalImageUrl } : {}),
      },
    });

    await invalidateEventsCache();

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

    if (!canManageEvent(req.user, existingEvent.createdBy)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.event.delete({
      where: { id },
    });

    await invalidateEventsCache();

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

    if (event.registrationLimit && event.registrationLimit > 0) {
      const regCount = await prisma.registration.count({
        where: { eventId },
      });
      if (regCount >= event.registrationLimit) {
        return res.status(400).json({
          message: 'Registration limit has been reached for this event.',
        });
      }
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

    await invalidateEventsCache();

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
    const { id, limit, offset } = req.params;
    const eventId = Number(id);
    const take = limit ? parseInt(limit as string, 10) : 10;
    const skip = offset ? parseInt(offset as string, 10) : 0;
    const searchString = (
      typeof req.query.search === 'string'
        ? req.query.search
        : typeof req.query.q === 'string'
          ? req.query.q
          : ''
    ).trim();

    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const where: any = {
      eventId,
      user: {
        isVerified: true,
      },
    };
    if (searchString) {
      where.OR = [
        { name: { contains: searchString, mode: 'insensitive' } },
        { email: { contains: searchString, mode: 'insensitive' } },
        { companyOrCollege: { contains: searchString, mode: 'insensitive' } },
        { contactNo: { contains: searchString, mode: 'insensitive' } },
      ];
    }

    const [registrations, total, event] = await Promise.all([
      prisma.registration.findMany({
        where,
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
        },
      }),
      prisma.registration.count({ where }),
      prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          name: true,
          registrationLimit: true,
          startRegistrationsNow: true,
          eventType: true,
          visibility: true,
        },
      }),
    ]);

    return res.json({ registrations, total, event });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const unregisterEventRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const regId = Number(id);
    if (Number.isNaN(regId)) {
      return res.status(400).json({ message: 'Invalid registration id' });
    }

    await prisma.registration.delete({
      where: { id: regId },
    });

    await invalidateEventsCache();

    return res.json({ message: 'User unregistered successfully' });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
