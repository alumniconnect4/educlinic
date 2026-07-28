import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const createHelpTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: 'Name, email and message are required' });
      return;
    }

    if (message.length > 500) {
      res.status(400).json({ message: 'Message cannot exceed 500 characters' });
      return;
    }

    const ticket = await prisma.helpTicket.create({
      data: {
        name,
        email,
        phone: phone || null,
        title: `Contact Request from ${name}`,
        description: message,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    });

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Error creating help ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHelpTickets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10) || 1;
    const limit = parseInt((req.query.limit as string) || '5', 10) || 5;
    const search = ((req.query.search as string) || '').trim();
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [tickets, total] = await Promise.all([
      prisma.helpTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.helpTicket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      data: tickets,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching help tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateHelpTicketStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const ticketId = parseInt(id as string, 10);
    if (isNaN(ticketId)) {
      res.status(400).json({ message: 'Invalid ticket ID' });
      return;
    }

    const updateData: any = {};
    if (status) {
      if (status !== 'OPEN' && status !== 'RESOLVED') {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }
      updateData.status = status;
    }
    if (priority) {
      if (priority !== 'LOW' && priority !== 'MEDIUM' && priority !== 'HIGH') {
        res.status(400).json({ message: 'Invalid priority value' });
        return;
      }
      updateData.priority = priority;
    }

    const updatedTicket = await prisma.helpTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    res
      .status(200)
      .json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating help ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
