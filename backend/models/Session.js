import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'User' },
  userEmail: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'Browser' },
  isValid: { type: Boolean, default: true },
  lastActiveAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model('Session', sessionSchema);
