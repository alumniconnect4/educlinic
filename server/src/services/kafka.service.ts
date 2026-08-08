import { Kafka, Producer, Consumer } from 'kafkajs';
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
    await consumer.connect();
    await consumer.subscribe({ topic: 'chat-messages', fromBeginning: false });
    logger.info('Kafka Consumer connected and subscribed to chat-messages');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }: { topic: string, partition: number, message: any }) => {
        if (!message.value) return;
        try {
          const payload = JSON.parse(message.value.toString());
          // Payload should be the formattedMessage
          // Emit to the receiver's room and the sender's room
          io.to(`user:${payload.receiverId}`).emit('receive_message', payload);
          // Only emit back to sender if the sender is on this specific node, but io.to handles that
          io.to(`user:${payload.senderId}`).emit('receive_message', payload);
        } catch (err) {
          logger.error('Error processing Kafka message:', err);
        }
      },
    });
  } catch (error) {
    logger.error('Failed to start Kafka Consumer:', error);
  }
};
