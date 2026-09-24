import crypto from 'crypto';
import { User } from '../models/User.js';

const hash = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');

export const getUsers = async (req, res) => {
  try { res.json(await User.find().select('-password').sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const createUser = async (req, res) => {
  try {
    const { name, phone, address, email, password } = req.body;
    if (!name || !phone || !address) return res.status(400).json({ message: 'Name, phone, and address are required' });
    res.status(201).json(await User.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: (email || '').trim().toLowerCase(),
      password: password ? hash(password) : ''
    }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = hash(updates.password);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteUser = async (req, res) => {
  try {
    if (!await User.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
