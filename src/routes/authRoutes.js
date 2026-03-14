import express from 'express';
import { register, login, registerStaff, getPublicTenants } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-staff', registerStaff);
router.post('/login', login);
router.get('/tenants', getPublicTenants);

export default router;
