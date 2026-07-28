import express from 'express';
import {
  addGalleryItem,
  getGalleryItems,
  deleteGalleryItem,
} from '../controller/gallery.controller.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router: express.Router = express.Router();

router.post('/', adminMiddleware, addGalleryItem);
router.get('/', getGalleryItems);
router.delete('/:id', adminMiddleware, deleteGalleryItem);

export default router;
