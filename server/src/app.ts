import express, { type Request, type Response } from 'express';

const app: express.Application = express();

const appMiddleware: express.RequestHandler[] = [
  express.json(),
  express.urlencoded({ extended: true }),
];

app.use(appMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

export default app;
