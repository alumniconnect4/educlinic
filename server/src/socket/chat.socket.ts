import { Server as SocketIOServer, Socket } from 'socket.io';
import { parseCookie } from 'cookie';
import { getSession } from '../config/cache.js';
import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';


export interface SocketUser {
  id: number;
  name: string;
  email: string;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

export const setupChatSocket = (io: SocketIOServer) => {
  io.use(async (socket: Socket, next) => {
    try {
      let sessionId: string | undefined;

      if (socket.handshake.auth?.sessionId) {
        sessionId = socket.handshake.auth.sessionId;
      } else if (socket.handshake.auth?.token) {
        sessionId = socket.handshake.auth.token;
      }

      if (!sessionId && socket.handshake.headers.cookie) {
        const cookies = parseCookie(socket.handshake.headers.cookie);
        sessionId = cookies.sessionId;
      }

      if (!sessionId) {
        return next(new Error('Authentication error: Missing session token'));
      }

      const session = await getSession(sessionId);
      if (!session) {
        return next(
          new Error('Authentication error: Invalid or expired session')
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      logger.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.user!;
    const userRoom = `user:${user.id}`;
    socket.join(userRoom);
    logger.info(
      `User connected to Socket.IO: ${user.name} (${user.id}) joined ${userRoom}`
    );

    socket.on(
      'send_message',
      async (data: { receiverId: number; content: string; tempId?: number }) => {
        try {
          const { receiverId, content, tempId } = data;
          if (!receiverId || !content?.trim()) return;

          const receiverExists = await prisma.user.findUnique({
            where: { id: receiverId },
          });

          if (!receiverExists) {
            socket.emit('error_message', { message: 'Recipient not found' });
            return;
          }

          const existingBlock = await prisma.block.findFirst({
            where: {
              OR: [
                { blockerId: user.id, blockedId: receiverId },
                { blockerId: receiverId, blockedId: user.id },
              ],
            },
          });

          if (existingBlock) {
            socket.emit('error_message', {
              message: 'Cannot send message due to a block',
            });
            return;
          }

          const message = await prisma.message.create({
            data: {
              senderId: user.id,
              receiverId,
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
            createdAt: message.createdAt.toISOString(),
            sender: message.sender,
            receiver: message.receiver,
            tempId,
          };

          io.to(`user:${receiverId}`).emit('receive_message', formattedMessage);
          io.to(`user:${user.id}`).emit('receive_message', formattedMessage);
        } catch (err) {
          logger.error('Failed to handle send_message socket event', err);
          socket.emit('error_message', { message: 'Failed to send message' });
        }
      }
    );

    socket.on('typing', (data: { receiverId: number }) => {
      if (data?.receiverId) {
        io.to(`user:${data.receiverId}`).emit('user_typing', {
          senderId: user.id,
        });
      }
    });

    socket.on('stop_typing', (data: { receiverId: number }) => {
      if (data?.receiverId) {
        io.to(`user:${data.receiverId}`).emit('user_stop_typing', {
          senderId: user.id,
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(
        `User disconnected from Socket.IO: ${user.name} (${user.id})`
      );
    });
  });
};
