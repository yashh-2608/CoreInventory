import { Router } from 'express';
import { signup, login, forgotPassword, verifyOtp, resetPassword, getMe, resendOtp } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);

export default router;
