import express from 'express';
import { getAllUsers, createUser, updateUserStatus, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'tenant_admin'));

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id/status')
  .put(updateUserStatus);

router.route('/:id')
  .delete(deleteUser);

export default router;
