import express from 'express';
import { getSubscriptions, manageSubscription } from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.route('/')
  .get(getSubscriptions)
  .post(manageSubscription);

export default router;
