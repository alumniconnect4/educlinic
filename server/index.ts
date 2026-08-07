import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectRedis } from './src/config/redis.js';
import { setupChatSocket } from './src/socket/chat.socket.js';

const httpServer = http.createServer(app);

const allowedOrigins = [
  "https://educlinic-henna.vercel.app",
  "https://educlinic-admin-portal.vercel.app",
  "https://educlinic-chat-app.vercel.app",
  "https://alumni-connect.ikeshav.in",
  "https://alumni-chat.ikeshav.in"
];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow non-browser clients (Postman, server-to-server, etc.)
      if (!origin) return callback(null, true);

      // Explicit allowlist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview/production deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(
        new Error(`Socket.IO CORS: Origin ${origin} is not allowed`)
      );
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

setupChatSocket(io);
app.set('io', io);

const startAllServices: () => Promise<void> = async () => {
  await Promise.all([connectRedis()]);
};

startAllServices().then(() => {
  httpServer.listen(env.PORT, () => {
    console.log(`Server and Socket.IO running on port ${env.PORT}`);
  });
});
