import express from 'express';
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  registerEvent,
  getEventRegistrations,
  unregisterEventRegistration,
} from '../controller/event.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { UserRole } from '../../generated/prisma/enums.js';

const router: express.Router = express.Router();

router.post('/create', adminMiddleware, createEvent);
router.post('/register/:id', authMiddleware(), registerEvent);
router.get(
  '/registrations/:id/:limit/:offset',
  adminMiddleware,
  getEventRegistrations
);
router.delete(
  '/registrations/:id',
  adminMiddleware,
  unregisterEventRegistration
);
router.get('/all-events/:limit/:offset', getAllEvents);
router.get('/all/:limit/:offset', getAllEvents);
router.get('/:id', getEventById);
router.patch('/update/:id', adminMiddleware, updateEvent);
router.delete('/delete/:id', adminMiddleware, deleteEvent);

export default router;
