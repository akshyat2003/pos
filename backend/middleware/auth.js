import jwt from 'jsonwebtoken';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const protect = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const session = await Session.findById(decoded.sessionId);
    const now = Date.now();
    const lastActive = session?.lastActiveAt ? new Date(session.lastActiveAt).getTime() : new Date(session?.createdAt || 0).getTime();

    if (!session || !session.isValid || session.expiresAt < new Date() || now - lastActive > INACTIVITY_TIMEOUT) {
      if (session?.isValid) await Session.findByIdAndUpdate(session._id, { isValid: false }).catch(() => {});
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session expired or revoked. Please log in again.' });
    }

    if (now - lastActive > 30000) await Session.findByIdAndUpdate(session._id, { lastActiveAt: new Date() }).catch(() => {});

    req.user = (decoded.userId && decoded.userId !== 'master-admin')
      ? await User.findById(decoded.userId).select('-password')
      : { _id: decoded.userId, name: session.userName, email: session.userEmail, role: session.role };
    req.sessionId = session._id;
    next();
  } catch {
    res.clearCookie('token');
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
