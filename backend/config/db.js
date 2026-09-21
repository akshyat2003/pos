import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS to reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where custom DNS is restricted
}

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_system';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} [${conn.connection.name}]`);
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`);
  }
};
