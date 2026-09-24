import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ['register', 'update_profile'], required: true },
    payload: { type: Object, default: {} },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

export const OTP = mongoose.model('OTP', otpSchema);
