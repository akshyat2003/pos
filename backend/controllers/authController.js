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
    lastActiveAt: new Date(),
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

    const cleanEmail = email.trim();
    const emailRegex = new RegExp('^' + cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const user = await User.findOne({ email: emailRegex });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const hashedPassword = hash(password);
    const isValidPassword = (user.password === hashedPassword) || (user.password === password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.password === password && user.password !== hashedPassword) {
      user.password = hashedPassword;
      await user.save().catch(() => {});
    }

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
      const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
      const user = await User.findOne({ email: emailRegex, role: 'admin' });
      if (user && (user.password === hash(password) || user.password === password)) {
        if (user.password === password && user.password !== hash(password)) {
          user.password = hash(password);
          await user.save().catch(() => {});
        }
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
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const sessions = await Session.find({
      isValid: true,
      expiresAt: { $gt: new Date() },
      $or: [
        { lastActiveAt: { $gt: fifteenMinsAgo } },
        { lastActiveAt: { $exists: false }, createdAt: { $gt: fifteenMinsAgo } }
      ]
    }).sort({ lastActiveAt: -1, createdAt: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const revokeSession = async (req, res) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isValid: false });
    res.json({ message: 'Session revoked successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

import { OTP } from '../models/OTP.js';
import { sendOTPEmail } from '../config/mailer.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendRegisterOTP = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email: normalizedEmail, type: 'register' });

    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      type: 'register',
      payload: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hash(password),
        address: address.trim()
      },
      expiresAt
    });

    await sendOTPEmail(normalizedEmail, otpCode, 'Account Registration Verification');
    res.json({ message: `OTP sent to ${normalizedEmail}`, email: normalizedEmail });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ email: normalizedEmail, type: 'register' });

    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    const { name, phone, password, address } = otpRecord.payload;
    if (await User.findOne({ email: normalizedEmail })) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email: normalizedEmail, phone, password, address, role: 'user' });
    await OTP.findByIdAndDelete(otpRecord._id);

    const { sessionId } = await createSessionAndToken(req, res, { userId: user._id, name: user.name, email: user.email, role: user.role });
    res.status(201).json({ ...sanitize(user), sessionId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const sendUpdateProfileOTP = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user._id === 'master-admin') {
      return res.status(400).json({ message: 'Master admin profile cannot be edited' });
    }

    const { name, email, phone, address, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined && !name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });
    if (email !== undefined && !email.trim()) return res.status(400).json({ message: 'Email cannot be empty' });

    const targetEmail = (email ? email.toLowerCase().trim() : user.email);

    if (email && targetEmail !== user.email) {
      const existing = await User.findOne({ email: targetEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Email address is already in use by another account' });
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      if (hash(currentPassword) !== user.password) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email: user.email, type: 'update_profile' });

    await OTP.create({
      email: user.email,
      otp: otpCode,
      type: 'update_profile',
      payload: {
        userId: user._id,
        name: name ? name.trim() : user.name,
        email: targetEmail,
        phone: phone !== undefined ? phone.trim() : user.phone,
        address: address !== undefined ? address.trim() : user.address,
        hashedPassword: newPassword ? hash(newPassword) : null
      },
      expiresAt
    });

    await sendOTPEmail(targetEmail, otpCode, 'Profile Update Verification');
    res.json({ message: `OTP verification code sent to ${targetEmail}`, email: targetEmail });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const verifyUpdateProfileOTP = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });

    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP code is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpRecord = await OTP.findOne({ email: user.email, type: 'update_profile' });
    if (!otpRecord || otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
    }

    const { name, email, phone, address, hashedPassword } = otpRecord.payload;

    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        await OTP.findByIdAndDelete(otpRecord._id);
        return res.status(400).json({ message: 'Email address is already in use by another account' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (hashedPassword) user.password = hashedPassword;

    await user.save();
    await OTP.findByIdAndDelete(otpRecord._id);

    res.json(sanitize(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });

    if (req.user._id === 'master-admin') {
      return res.status(400).json({ message: 'Master admin profile cannot be edited' });
    }

    const { name, email, phone, address, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined && !name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });
    if (email !== undefined && !email.trim()) return res.status(400).json({ message: 'Email cannot be empty' });

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Email address is already in use by another account' });
      }
      user.email = normalizedEmail;
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update password' });
      }
      if (hash(currentPassword) !== user.password) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }
      user.password = hash(newPassword);
    }

    await user.save();
    res.json(sanitize(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

