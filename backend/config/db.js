import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_system';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} [${conn.connection.name}]`);
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`);
  }
};
