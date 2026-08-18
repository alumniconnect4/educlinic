import { Queue, Worker, Job } from 'bullmq';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/db.js';
import { getKafkaProducer } from './kafka.service.js';
import cloudinary from '../config/cloudinary.js';
import { deleteUserCache, invalidateUsersCache } from '../config/cache.js';
import { DEFAULT_AVATAR_URL, isBase64Image } from '../utils/constants.js';

const connection = {
  host: config.redisQueue.host,
  port: config.redisQueue.port,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number) => Math.min(times * 200, 3000),
};

export const chatQueue = new Queue('chat-queue', { connection });

export interface UserImageUploadJobData {
  userId: number;
  imageData: string;
  field: 'avatarUrl' | 'idCardUrl' | 'degreeUrl';
  folder?: string;
}

export const imageUploadQueue = new Queue<UserImageUploadJobData>(
  'image-upload-queue',
  { connection }
);

export const enqueueUserImageUpload = async (
  userId: number,
  imageData: string,
  field: 'avatarUrl' | 'idCardUrl' | 'degreeUrl',
  folder = 'avatars'
) => {
  if (!imageData || !isBase64Image(imageData)) {
    return;
  }
  await imageUploadQueue.add(
    `upload-${field}-${userId}-${Date.now()}`,
    {
      userId,
      imageData,
      field,
      folder,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  logger.info(`Enqueued ${field} upload job for user ${userId}`);
};

export const initImageUploadWorker = () => {
  const worker = new Worker<UserImageUploadJobData>(
    'image-upload-queue',
    async (job: Job<UserImageUploadJobData>) => {
      const { userId, imageData, field, folder } = job.data;
      logger.info(
        `Processing image upload job for user ${userId}, field: ${field}`
      );

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (!user) {
        logger.warn(`User ${userId} not found for image upload job`);
        return;
      }

      try {
        const uploadRes = await cloudinary.uploader.upload(imageData, {
          folder: folder || 'avatars',
        });

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            [field]: uploadRes.secure_url,
          },
        });

        await deleteUserCache(user.email);
        await invalidateUsersCache();

        logger.info(
          `Successfully uploaded ${field} for user ${userId} to Cloudinary: ${uploadRes.secure_url}`
        );
        return updatedUser;
      } catch (err: any) {
        logger.error(
          `Cloudinary upload failed for user ${userId}, field: ${field}:`,
          err
        );
        // Fallback: if field is avatarUrl, ensure default avatar is set if currently empty/invalid
        if (field === 'avatarUrl') {
          await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: DEFAULT_AVATAR_URL },
          });
        }
        await deleteUserCache(user.email);
        await invalidateUsersCache();
        throw err;
      }
    },
    { connection, concurrency: 5 }
  );

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(
      `Image upload job ${job?.id} failed with error ${err.message}`
    );
  });

  logger.info('BullMQ Image Upload Worker initialized');
};

export const initChatWorker = (io?: SocketIOServer) => {
  const worker = new Worker(
    'chat-queue',
    async (job: Job) => {
      const { senderId, receiverId, content, tempId } = job.data;

      try {
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: content.trim(),
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
            receiver: { select: { id: true, name: true, avatarUrl: true } },
          },
        });
        logger.info(`Message saved to DB in background: ${message.id}`);

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
          tempId,
        };

        try {
          const producer = await getKafkaProducer();
          await producer.send({
            topic: 'chat-messages',
            messages: [{ value: JSON.stringify(formattedMessage) }],
          });
        } catch (kafkaErr) {
          logger.warn(
            'Kafka publish from BullMQ worker failed, using direct Socket.IO fallback:',
            kafkaErr
          );
          if (io) {
            io.to(`user:${receiverId}`).emit('receive_message', formattedMessage);
            io.to(`user:${senderId}`).emit('receive_message', formattedMessage);
          }
        }

        return message;
      } catch (error) {
        logger.error('Failed to save message to DB in worker:', error);
        throw error;
      }
    },
    { connection }
  );

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`Job ${job?.id} failed with error ${err.message}`);
  });

  logger.info('BullMQ Chat Worker initialized');
};

