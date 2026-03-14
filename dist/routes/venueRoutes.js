import express from 'express';
import { getVenues, createVenue } from '../controllers/venueController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();
router.use(protect);
router.route('/')
    .get(getVenues)
    .post(authorize('tenant_admin', 'super_admin'), createVenue);
export default router;
