import express from 'express';
import { 
  loginAdmin, 
  logout, 
  getAdmins, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin,
  getAlumniStudents,
  createAlumniStudent,
  updateAlumniStudent,
  deleteAlumniStudent,
  getPendingRequests,
  approvePendingRequest,
  declinePendingRequest
} from '../controller/admin.controller.js';
import { getOverviewStats, getRoleSchoolStats, getRecentEvents, getCommunityStats, getHelpTicketStats } from '../controller/analytics.controller.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router: express.Router = express.Router();


router.post('/login', loginAdmin);
router.get('/logout', logout);

// Admin Management Routes
router.get('/admins', adminMiddleware, getAdmins);
router.post('/admins', adminMiddleware, createAdmin);
router.put('/admins/:id', adminMiddleware, updateAdmin);
router.delete('/admins/:id', adminMiddleware, deleteAdmin);

// Alumni & Students Management Routes
router.get('/alumni-students', adminMiddleware, getAlumniStudents);
router.post('/alumni-students', adminMiddleware, createAlumniStudent);
router.put('/alumni-students/:id', adminMiddleware, updateAlumniStudent);
router.delete('/alumni-students/:id', adminMiddleware, deleteAlumniStudent);

// Pending Registration Requests Routes
router.get('/pending-requests', adminMiddleware, getPendingRequests);
router.put('/pending-requests/:id/approve', adminMiddleware, approvePendingRequest);
router.delete('/pending-requests/:id/decline', adminMiddleware, declinePendingRequest);

// Analytics Routes
router.get('/analytics/overview', adminMiddleware, getOverviewStats);
router.get('/analytics/school/:role', adminMiddleware, getRoleSchoolStats);
router.get('/analytics/recent-events', adminMiddleware, getRecentEvents);
router.get('/analytics/community', adminMiddleware, getCommunityStats);
router.get('/analytics/help-tickets', adminMiddleware, getHelpTicketStats);

export default router;