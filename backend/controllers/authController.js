import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

const hash = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');
const sanitize = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, address: u.address, role: u.role });

const createSessionAndToken = async (req, res, { userId, name, email, role }) => {
  const session = await Session.create({
    user: mongoose.isValidObjectId(userId) ? userId : undefined,
    userName: name,
    userEmail: email,
    role,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Browser',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  const token = jwt.sign(
    { userId, sessionId: session._id, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return { token, sessionId: session._id };
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !password || !phone || !address) return res.status(400).json({ message: 'All fields required' });

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, phone: phone.trim(), password: hash(password), address: address.trim(), role: 'user' });
    res.status(201).json(sanitize(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.password !== hash(password)) return res.status(401).json({ message: 'Invalid email or password' });

    const { sessionId } = await createSessionAndToken(req, res, { userId: user._id, name: user.name, email: user.email, role: user.role });
    res.json({ ...sanitize(user), sessionId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Admin credentials required' });

    const normalizedEmail = email.toLowerCase().trim();
    const defEmail = (process.env.ADMIN_EMAIL || 'admin@pos.com').toLowerCase();
    const defPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (normalizedEmail === defEmail && password === defPass) {
      const adminData = { _id: 'master-admin', name: 'Master Admin', email: defEmail, role: 'admin' };
      const { sessionId } = await createSessionAndToken(req, res, { userId: adminData._id, name: adminData.name, email: adminData.email, role: 'admin' });
      return res.json({ ...adminData, sessionId });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail, role: 'admin' });
      if (user && user.password === hash(password)) {
        const { sessionId } = await createSessionAndToken(req, res, { userId: user._id, name: user.name, email: user.email, role: 'admin' });
        return res.json({ ...sanitize(user), sessionId });
      }
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const logout = async (req, res) => {
  try {
    if (req.sessionId) await Session.findByIdAndUpdate(req.sessionId, { isValid: false });
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user, sessionId: req.sessionId });
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isValid: true, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const revokeSession = async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isValid: false });
    res.json({ message: 'Session revoked successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
