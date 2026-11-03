import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createPost,
  getAllPosts,
  getPostById,
  togglePostLike,
  createComment,
  getPostComments,
  getCommentReplies,
  toggleCommentLike,
  deleteComment,
  deletePost,
  uploadImage,
} from '../controller/post.controller.js';

const router: Router = Router();

router.get('/', authMiddleware(), getAllPosts);
router.get('/:id', authMiddleware(), getPostById);
router.get('/:id/comments', authMiddleware(), getPostComments);
router.get('/comments/:commentId/replies', authMiddleware(), getCommentReplies);
router.post('/', authMiddleware(), createPost);
router.post('/upload', authMiddleware(), uploadImage);
router.post('/:id/like', authMiddleware(), togglePostLike);
router.post('/:id/comments', authMiddleware(), createComment);
router.post('/comments/:commentId/like', authMiddleware(), toggleCommentLike);
router.delete('/:id', authMiddleware(), deletePost);
router.delete('/comments/:commentId', authMiddleware(), deleteComment);

export default router;
