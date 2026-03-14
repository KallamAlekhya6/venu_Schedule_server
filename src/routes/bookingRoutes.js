import express from 'express';
import { getBookings, createBooking, updateBookingStatus, updateBooking, deleteBooking } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id/status')
  .put(authorize('tenant_admin', 'super_admin'), updateBookingStatus);

router.route('/:id')
  .put(updateBooking)
  .delete(deleteBooking);

export default router;
