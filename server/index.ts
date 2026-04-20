import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectRedis } from './src/config/redis.js';

const startAllServices: () => Promise<void> = async () => {
  Promise.all([connectRedis()]);
};

startAllServices().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
});
