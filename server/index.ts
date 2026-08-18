import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app, { isOriginAllowed } from './src/app.js';
import { env } from './src/config/env.js';
import { connectRedis } from './src/config/redis.js';
import { setupChatSocket } from './src/socket/chat.socket.js';

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`Socket.IO CORS: Origin ${origin} is not allowed`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setupChatSocket(io);
app.set('io', io);

import { startKafkaConsumer } from './src/services/kafka.service.js';
import {
  initChatWorker,
  initImageUploadWorker,
} from './src/services/queue.service.js';

const startAllServices: () => Promise<void> = async () => {
  await Promise.all([connectRedis()]);
  initChatWorker(io);
  initImageUploadWorker();
  await startKafkaConsumer(io);
};

startAllServices().then(() => {
  httpServer.listen(env.PORT, () => {
    console.log(`Server and Socket.IO running on port ${env.PORT}`);
  });
});
