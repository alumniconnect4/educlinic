import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowCounts,
} from '../controller/follow.controller.js';

const router: Router = Router();

router.post('/', authMiddleware(), followUser);
router.delete('/', authMiddleware(), unfollowUser);
router.get('/:userId/followers', authMiddleware(), getFollowers);
router.get('/:userId/following', authMiddleware(), getFollowing);
router.get('/:userId/counts', authMiddleware(), getFollowCounts);

export default router;
