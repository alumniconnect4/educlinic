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

const ensureTopicsExist = async (retries = 5, delayMs = 2000): Promise<void> => {
  const admin = kafka.admin();
  let attempt = 0;
  while (attempt < retries) {
    attempt++;
    try {
      await admin.connect();
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
      if (err?.name === 'TopicExistsError' || err?.message?.includes('exists')) {
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
  logger.warn('Kafka admin topic creation bypassed; continuing with consumer subscription.');
};

export const startKafkaConsumer = async (io: SocketIOServer) => {
  await ensureTopicsExist();

  consumer = kafka.consumer({
    groupId: `chat-backend-${Date.now()}`,
    retry: {
      initialRetryTime: 1000,
      retries: 10,
      maxRetryTime: 60000,
    },
  });

  consumer.on(consumer.events.DISCONNECT, () => {
    logger.warn('Kafka Consumer disconnected');
  });

  consumer.on(consumer.events.CRASH, (event) => {
    logger.error('Kafka Consumer crashed:', event.payload.error);
  });

  let retries = 10;
  while (retries > 0) {
    try {
      await consumer.connect();
      await consumer.subscribe({
        topic: 'chat-messages',
        fromBeginning: false,
      });
      logger.info('Kafka Consumer connected and subscribed to chat-messages');

      await consumer.run({
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
            // Payload should be the formattedMessage
            // Emit to the receiver's room and the sender's room
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
      break;
    } catch (error) {
      retries--;
      logger.error(
        `Failed to start Kafka Consumer (${retries} retries left):`,
        error
      );
      if (retries === 0) {
        logger.error('Exhausted all retries for Kafka Consumer.');
        break;
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

