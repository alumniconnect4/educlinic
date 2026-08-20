import os from 'os';
import { Kafka, type Producer, type Consumer } from 'kafkajs';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { Server as SocketIOServer } from 'socket.io';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  retry: {
    initialRetryTime: 500,
    retries: 10,
    maxRetryTime: 30000,
    factor: 1.5,
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
});

let producer: Producer | null = null;
let consumer: Consumer | null = null;

export const getKafkaProducer = async (): Promise<Producer> => {
  if (producer) return producer;

  const newProducer = kafka.producer({
    allowAutoTopicCreation: true,
    retry: {
      initialRetryTime: 300,
      retries: 5,
    },
  });

  try {
    await newProducer.connect();
    producer = newProducer;
    logger.info('Kafka Producer connected successfully');

    newProducer.on(newProducer.events.DISCONNECT, () => {
      logger.warn('Kafka Producer disconnected, will reconnect on next call');
      producer = null;
    });

    return producer;
  } catch (error) {
    logger.error('Failed to connect Kafka Producer:', error);
    producer = null;
    throw error;
  }
};

const ensureTopicsExist = async (
  retries = 5,
  delayMs = 2000
): Promise<void> => {
  const admin = kafka.admin();
  let attempt = 0;
  while (attempt < retries) {
    attempt++;
    try {
      await admin.connect();
      const existingTopics = await admin.listTopics();
      if (existingTopics.includes('chat-messages')) {
        logger.info('Kafka topic "chat-messages" already exists');
        await admin.disconnect();
        return;
      }

      await admin.createTopics({
        topics: [
          { topic: 'chat-messages', numPartitions: 3, replicationFactor: 1 },
        ],
        waitForLeaders: true,
      });
      await admin.disconnect();
      logger.info('Kafka topic "chat-messages" verified/created successfully');
      return;
    } catch (err: any) {
      try {
        await admin.disconnect();
      } catch {}
      if (
        err?.name === 'TopicExistsError' ||
        err?.message?.includes('exists')
      ) {
        logger.info('Kafka topic "chat-messages" already exists');
        return;
      }
      logger.warn(
        `Kafka admin topic check attempt ${attempt}/${retries} warning: ${err?.message || err}`
      );
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  logger.warn(
    'Kafka admin topic creation bypassed; continuing with consumer subscription.'
  );
};

export const startKafkaConsumer = async (io: SocketIOServer) => {
  await ensureTopicsExist();

  const baseGroupId = process.env.KAFKA_GROUP_ID || 'chat-backend-group';
  const instanceId =
    process.env.HOSTNAME ||
    process.env.POD_NAME ||
    os.hostname() ||
    Math.random().toString(36).substring(2, 9);
  const groupId = `${baseGroupId}-${instanceId}`;

  let retries = 15;
  let isConnected = false;

  while (retries > 0 && !isConnected) {
    if (consumer) {
      try {
        await consumer.disconnect();
      } catch {}
      consumer = null;
    }

    const currentConsumer = kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
      allowAutoTopicCreation: true,
      retry: {
        initialRetryTime: 1000,
        retries: 10,
        maxRetryTime: 30000,
      },
    });

    currentConsumer.on(currentConsumer.events.DISCONNECT, () => {
      logger.warn('Kafka Consumer disconnected');
    });

    currentConsumer.on(currentConsumer.events.CRASH, (event) => {
      logger.error('Kafka Consumer crashed:', event.payload.error);
      setTimeout(() => {
        logger.info('Attempting to restart crashed Kafka Consumer...');
        startKafkaConsumer(io).catch((err) =>
          logger.error('Failed to restart Kafka Consumer:', err)
        );
      }, 5000);
    });

    try {
      await currentConsumer.connect();
      await currentConsumer.subscribe({
        topic: 'chat-messages',
        fromBeginning: false,
      });

      consumer = currentConsumer;
      logger.info(
        `Kafka Consumer connected and subscribed to chat-messages (groupId: ${groupId})`
      );

      await currentConsumer.run({
        eachMessage: async ({
          topic,
          partition,
          message,
        }: {
          topic: string;
          partition: number;
          message: any;
        }) => {
          if (!message.value) return;
          try {
            const payload = JSON.parse(message.value.toString());
            io.to(`user:${payload.receiverId}`).emit(
              'receive_message',
              payload
            );
            io.to(`user:${payload.senderId}`).emit('receive_message', payload);
          } catch (err) {
            logger.error('Error processing Kafka message:', err);
          }
        },
      });

      isConnected = true;
    } catch (error: any) {
      retries--;
      logger.error(
        `Failed to start Kafka Consumer (${retries} retries left): ${error?.message || error}`
      );
      if (retries === 0) {
        logger.error('Exhausted all retries for Kafka Consumer.');
        break;
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};
