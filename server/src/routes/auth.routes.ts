import {
  login,
  logout,
  register,
  getCurrentUser,
} from '../controller/auth.controller.js';
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router: express.Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', authMiddleware(), getCurrentUser);

export default router;
