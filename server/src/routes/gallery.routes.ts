import express from 'express';
import {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  deleteAlbum,
  addImagesToAlbum,
  addSingleImageToAlbum,
  deleteImage,
  deleteBulkImages,
  updateAlbum,
} from '../controller/gallery.controller.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router: express.Router = express.Router();

router.post('/create', adminMiddleware, createAlbum);
router.get('/all/:limit/:offset', getAllAlbums);
router.get('/:id', getAlbumById);
router.patch('/update/:id', adminMiddleware, updateAlbum);
router.delete('/delete/:id', adminMiddleware, deleteAlbum);
router.post('/:id/images', adminMiddleware, addImagesToAlbum);
router.post('/:id/image', adminMiddleware, addSingleImageToAlbum);
router.delete('/images/bulk', adminMiddleware, deleteBulkImages);
router.delete('/image/:imageId', adminMiddleware, deleteImage);

export default router;
