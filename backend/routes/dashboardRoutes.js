import express from 'express';
import { dashboardSearch, getDashboardOverview } from '../controllers/dashboardController.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);
router.get('/overview', getDashboardOverview);
router.get('/search', dashboardSearch);

export default router;
