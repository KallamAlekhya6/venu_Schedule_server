import express from 'express';
import { getRooms, createRoom } from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('tenant_admin', 'super_admin'), createRoom);

router.route('/:venueId')
  .get(getRooms);

export default router;
