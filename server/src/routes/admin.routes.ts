import express from 'express';
import { loginAdmin, logout } from '../controller/admin.controller.js';
import { getOverviewStats, getRoleSchoolStats, getRecentEvents, getCommunityStats, getHelpTicketStats } from '../controller/analytics.controller.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router: express.Router = express.Router();


router.post('/login', loginAdmin);
router.get('/logout', logout);

// Analytics Routes
router.get('/analytics/overview', adminMiddleware, getOverviewStats);
router.get('/analytics/school/:role', adminMiddleware, getRoleSchoolStats);
router.get('/analytics/recent-events', adminMiddleware, getRecentEvents);
router.get('/analytics/community', adminMiddleware, getCommunityStats);
router.get('/analytics/help-tickets', adminMiddleware, getHelpTicketStats);

export default router;