import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { db } from './src/config/db.js';
import { logger } from './src/config/logger.js';

const server: http.Server = http.createServer(app);

const services = async () => {
  Promise.all([await db.connect()]);
};

db.connect().then(() => {
  server.listen(env.PORT, () => {
    logger.info(`Server is running on  http://${env.HOST}:${env.PORT}`);
  });
});