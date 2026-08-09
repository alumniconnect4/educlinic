import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  getCache,
  setCache,
  generateConversationsCacheKey,
  generateMessagesCacheKey,
  invalidateChatCache,
} from '../config/cache.js';

export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;

    const cacheKey = generateConversationsCacheKey(currentUserId);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const partnersRaw = await prisma.$queryRaw<{ partner_id: number }[]>`
      SELECT DISTINCT
        CASE
          WHEN "senderId" = ${currentUserId} THEN "receiverId"
          ELSE "senderId"
        END as partner_id
      FROM "Message"
      WHERE "senderId" = ${currentUserId} OR "receiverId" = ${currentUserId}
    `;

    const partnerIds = partnersRaw.map((p) => p.partner_id);

    if (partnerIds.length === 0) {
      const responsePayload = { conversations: [] };
      await setCache(cacheKey, responsePayload, 300);
      res.status(200).json(responsePayload);
      return;
    }

    const blocks = await prisma.block.findMany({
      where: {
        OR: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
      },
    });

    const blockedByMeIds = new Set<number>();
    const hasBlockedMeIds = new Set<number>();
    blocks.forEach((b) => {
      if (b.blockerId === currentUserId) blockedByMeIds.add(b.blockedId);
      if (b.blockedId === currentUserId) hasBlockedMeIds.add(b.blockerId);
    });

    const clearedChats = await prisma.clearedChat.findMany({
      where: { userId: currentUserId },
    });
    const clearedMap = new Map<number, Date>();
    clearedChats.forEach((c) => clearedMap.set(c.partnerId, c.clearedAt));

    const conversations = (
      await Promise.all(
        partnerIds.map(async (partnerId) => {
          const clearedAt = clearedMap.get(partnerId);

          const lastMsg = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: currentUserId, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUserId },
              ],
              ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  schoolCategory: true,
                  avatarUrl: true,
                },
              },
              receiver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  schoolCategory: true,
                  avatarUrl: true,
                },
              },
            },
          });

          if (!lastMsg) return null;

          const unreadCount = await prisma.message.count({
            where: {
              senderId: partnerId,
              receiverId: currentUserId,
              isRead: false,
              ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}),
            },
          });

          const participant =
            lastMsg.senderId === currentUserId
              ? lastMsg.receiver
              : lastMsg.sender;

          return {
            id: partnerId,
            participant,
            lastMessage: {
              id: lastMsg.id,
              senderId: lastMsg.senderId,
              receiverId: lastMsg.receiverId,
              content: lastMsg.content,
              isRead: lastMsg.isRead,
              isEdited: lastMsg.isEdited,
              createdAt: lastMsg.createdAt.toISOString(),
            },
            unreadCount,
            blockedByMe: blockedByMeIds.has(partnerId),
            hasBlockedMe: hasBlockedMeIds.has(partnerId),
          };
        })
      )
    ).filter(Boolean);

    conversations.sort(
      (a: any, b: any) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    const responsePayload = { conversations };
    await setCache(cacheKey, responsePayload, 300);

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessagesWithUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const partnerId = parseInt(req.params.partnerId as string, 10);
    const cursor = req.query.cursor
      ? parseInt(req.query.cursor as string, 10)
      : undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 30;

    if (isNaN(partnerId)) {
      res.status(400).json({ message: 'Invalid partner user ID' });
      return;
    }

    const cacheKey = generateMessagesCacheKey(
      currentUserId,
      partnerId,
      cursor,
      limit
    );
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const clearedChat = await prisma.clearedChat.findUnique({
      where: {
        userId_partnerId: {
          userId: currentUserId,
          partnerId: partnerId,
        },
      },
    });
    const clearedAt = clearedChat?.clearedAt;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId },
        ],
        ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursor && !isNaN(cursor) ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    let nextCursor: number | null = null;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    const unreadMessageIds = messages
      .filter((msg) => msg.senderId === partnerId && !msg.isRead)
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true },
      });
      await invalidateChatCache(currentUserId, partnerId);
    }

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      isRead: msg.isRead,
      isEdited: msg.isEdited,
      createdAt: msg.createdAt.toISOString(),
      sender: msg.sender,
      receiver: msg.receiver,
    }));

    const responsePayload = { messages: formattedMessages, nextCursor };
    await setCache(cacheKey, responsePayload, 300);

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markMessagesAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const partnerId = parseInt(req.params.partnerId as string, 10);

    if (isNaN(partnerId)) {
      res.status(400).json({ message: 'Invalid partner user ID' });
      return;
    }

    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    await invalidateChatCache(currentUserId, partnerId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendMessageHttp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      res.status(400).json({ message: 'Receiver ID and content are required' });
      return;
    }

    const receiverExists = await prisma.user.findUnique({
      where: { id: Number(receiverId) },
    });

    if (!receiverExists) {
      res.status(404).json({ message: 'Recipient user not found' });
      return;
    }

    const existingBlock = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: currentUserId, blockedId: Number(receiverId) },
          { blockerId: Number(receiverId), blockedId: currentUserId },
        ],
      },
    });

    if (existingBlock) {
      res
        .status(403)
        .json({ message: 'Cannot send message to this user due to a block' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId: currentUserId,
        receiverId: Number(receiverId),
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    const formattedMessage = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      isRead: message.isRead,
      isEdited: message.isEdited,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
      receiver: message.receiver,
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('receive_message', formattedMessage);
      io.to(`user:${currentUserId}`).emit('receive_message', formattedMessage);
    }

    await invalidateChatCache(currentUserId, Number(receiverId));

    res.status(201).json({
      message: formattedMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const editMessageHttp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const messageId = parseInt(req.params.messageId as string, 10);
    const { content } = req.body;

    if (isNaN(messageId) || !content?.trim()) {
      res.status(400).json({ message: 'Message ID and content are required' });
      return;
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    if (message.senderId !== currentUserId) {
      res.status(403).json({ message: 'You can only edit your own messages' });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim(), isEdited: true },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    const formattedMessage = {
      id: updatedMessage.id,
      senderId: updatedMessage.senderId,
      receiverId: updatedMessage.receiverId,
      content: updatedMessage.content,
      isRead: updatedMessage.isRead,
      isEdited: updatedMessage.isEdited,
      createdAt: updatedMessage.createdAt.toISOString(),
      sender: updatedMessage.sender,
      receiver: updatedMessage.receiver,
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${updatedMessage.receiverId}`).emit(
        'message_edited',
        formattedMessage
      );
      io.to(`user:${currentUserId}`).emit('message_edited', formattedMessage);
    }

    await invalidateChatCache(currentUserId, updatedMessage.receiverId);

    res.status(200).json({ message: formattedMessage });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMessageHttp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const messageId = parseInt(req.params.messageId as string, 10);

    if (isNaN(messageId)) {
      res.status(400).json({ message: 'Invalid message ID' });
      return;
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    if (message.senderId !== currentUserId) {
      res
        .status(403)
        .json({ message: 'You can only delete your own messages' });
      return;
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${message.receiverId}`).emit('message_deleted', {
        messageId,
        receiverId: message.receiverId,
        senderId: currentUserId,
      });
      io.to(`user:${currentUserId}`).emit('message_deleted', {
        messageId,
        receiverId: message.receiverId,
        senderId: currentUserId,
      });
    }

    await invalidateChatCache(currentUserId, message.receiverId);

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const clearChatHttp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const partnerId = parseInt(req.params.partnerId as string, 10);

    if (isNaN(partnerId)) {
      res.status(400).json({ message: 'Invalid partner user ID' });
      return;
    }

    await prisma.clearedChat.upsert({
      where: {
        userId_partnerId: {
          userId: currentUserId,
          partnerId: partnerId,
        },
      },
      update: {
        clearedAt: new Date(),
      },
      create: {
        userId: currentUserId,
        partnerId: partnerId,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${currentUserId}`).emit('chat_cleared', { partnerId });
    }

    await invalidateChatCache(currentUserId, partnerId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error clearing chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
