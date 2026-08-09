import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/db.js';

const connection = {
  host: config.redisQueue.host,
  port: config.redisQueue.port,
};

export const chatQueue = new Queue('chat-queue', { connection });

export const initChatWorker = () => {
  const worker = new Worker(
    'chat-queue',
    async (job: Job) => {
      const { senderId, receiverId, content } = job.data;

      try {
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: content.trim(),
          },
          include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } },
          },
        });
        logger.info(`Message saved to DB in background: ${message.id}`);
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
