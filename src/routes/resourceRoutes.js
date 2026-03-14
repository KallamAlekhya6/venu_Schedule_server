import express from 'express';
import { getResources, createResource } from '../controllers/resourceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getResources)
  .post(authorize('tenant_admin', 'super_admin'), createResource);

export default router;
