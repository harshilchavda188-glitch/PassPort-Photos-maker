import { Router } from 'express';
import {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/me', protect, getMe);

export default router;
