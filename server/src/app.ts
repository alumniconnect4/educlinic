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
import adminRoutes from './routes/admin.routes.js';
import galleryRoutes from './routes/gallery.routes.js';

const app: express.Application = express();

app.set('trust proxy', 1);

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true;

  const allowedOrigins = [
    'https://educlinic-henna.vercel.app',
    'https://educlinic-admin-portal.vercel.app',
    'https://educlinic-chat-app.vercel.app',
    'https://alumni-connect.ikeshav.in',
    'https://alumni-chat.ikeshav.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ];

  if (allowedOrigins.includes(origin)) return true;

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.endsWith('.vercel.app')) return true;
    if (hostname === 'h4x.co.in' || hostname.endsWith('.h4x.co.in'))
      return true;
    if (hostname === 'ikeshav.in' || hostname.endsWith('.ikeshav.in'))
      return true;
  } catch (err) {
    // Ignore URL parse error
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

const appMiddleware: express.RequestHandler[] = [
  express.json({ limit: '100mb' }),
  express.urlencoded({ limit: '100mb', extended: true }),
  cookieParser(),
  morgan('dev'),
];

app.use(appMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.send('API is working...');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin-portal', adminRoutes);
app.use('/api/gallery', galleryRoutes);

export default app;
