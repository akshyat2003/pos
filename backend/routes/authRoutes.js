import express from 'express';
import {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  updateProfile,
  sendRegisterOTP,
  verifyRegisterOTP,
  sendUpdateProfileOTP,
  verifyUpdateProfileOTP,
  getSessions,
  revokeSession
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/send-register-otp', sendRegisterOTP);
router.post('/verify-register-otp', verifyRegisterOTP);
router.post('/send-update-otp', protect, sendUpdateProfileOTP);
router.post('/verify-update-otp', protect, verifyUpdateProfileOTP);

router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/sessions', protect, adminOnly, getSessions);
router.delete('/sessions/:id', protect, adminOnly, revokeSession);

export default router;
