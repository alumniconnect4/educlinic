import express from 'express';
import { askAssistant } from '../controller/ai.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router: express.Router = express.Router();

router.post('/ask', askAssistant);

export default router;
