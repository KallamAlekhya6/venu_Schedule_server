import express from 'express';
import { getMyTenant, getAllTenants } from '../controllers/tenantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyTenant);
router.get('/', protect, authorize('super_admin'), getAllTenants);

export default router;
