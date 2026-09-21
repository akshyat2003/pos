import express from 'express';
import { register, login, adminLogin, logout, getMe, getSessions, revokeSession } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/sessions', protect, adminOnly, getSessions);
router.delete('/sessions/:id', protect, adminOnly, revokeSession);

export default router;
