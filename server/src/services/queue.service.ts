import { Queue, Worker, Job } from 'bullmq';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/db.js';
import { getKafkaProducer } from './kafka.service.js';

const connection = {
  host: config.redisQueue.host,
  port: config.redisQueue.port,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number) => Math.min(times * 200, 3000),
};

export const chatQueue = new Queue('chat-queue', { connection });

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
