import jwt from 'jsonwebtoken';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const session = await Session.findById(decoded.sessionId);
    if (!session || !session.isValid || session.expiresAt < new Date()) {
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session expired or revoked. Please log in again.' });
    }

    let user = null;
    if (decoded.userId && decoded.userId !== 'master-admin') {
      user = await User.findById(decoded.userId).select('-password');
    }
    req.user = user || { _id: decoded.userId, name: session.userName, email: session.userEmail, role: session.role };
    req.sessionId = session._id;
    next();
  } catch (err) {
    res.clearCookie('token');
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};
