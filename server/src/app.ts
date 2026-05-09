import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import morgan from 'morgan';

const app: express.Application = express();

const appMiddleware: express.RequestHandler[] = [
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser(),
  morgan('dev'),
];

app.use(appMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);

export default app;
