import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllUsers,
  getDevelopers,
  getUserById,
  blockUser,
  unblockUser,
  updateProfile,
} from '../controller/user.controller.js';

const router: express.Router = express.Router();

router.get('/', authMiddleware(), getAllUsers);
router.get('/developers', authMiddleware(), getDevelopers);
router.get('/:id', authMiddleware(), getUserById);
router.post('/:id/block', authMiddleware(), blockUser);
router.post('/:id/unblock', authMiddleware(), unblockUser);
router.put('/profile', authMiddleware(), updateProfile);

export default router;
