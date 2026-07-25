import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import morgan from 'morgan';
import eventRoutes from './routes/event.routes.js';
import postRoutes from './routes/post.routes.js';
import followRoutes from './routes/follow.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { authMiddleware } from './middleware/auth.js';
import { UserRole } from '../generated/prisma/enums.js';

const app: express.Application = express();

const appMiddleware: express.RequestHandler[] = [
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  }),
  express.json({ limit: '25mb' }),
  express.urlencoded({ limit: '25mb', extended: true }),
  cookieParser(),
  morgan('dev'),
];

app.use(appMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

export default app;
