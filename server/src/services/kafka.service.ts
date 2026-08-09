import { Kafka, type Producer, type Consumer } from 'kafkajs';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { Server as SocketIOServer } from 'socket.io';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

let producer: Producer | null = null;
let consumer: Consumer | null = null;

export const getKafkaProducer = async (): Promise<Producer> => {
  if (producer) return producer;

  producer = kafka.producer();
  try {
    await producer.connect();
    logger.info('Kafka Producer connected successfully');
    return producer;
  } catch (error) {
    logger.error('Failed to connect Kafka Producer:', error);
    throw error;
  }
};

export const startKafkaConsumer = async (io: SocketIOServer) => {
  consumer = kafka.consumer({ groupId: `chat-backend-${Date.now()}` }); // Unique group ID so every instance gets the message

  try {
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [
        { topic: 'chat-messages', numPartitions: 3, replicationFactor: 1 },
      ],
      waitForLeaders: true,
    });
    await admin.disconnect();
  } catch (err) {
    logger.warn('Kafka admin topic check warning:', err);
  }

  let retries = 5;
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
      if (retries === 0) break;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};
