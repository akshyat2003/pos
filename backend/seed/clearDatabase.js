import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

dotenv.config();

async function clearTestData() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('No MONGO_URI in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);

    // Delete test orders and test users
    const ordersResult = await Order.deleteMany({});
    console.log(`Deleted ${ordersResult.deletedCount} test orders.`);

    const usersResult = await User.deleteMany({});
    console.log(`Deleted ${usersResult.deletedCount} test users.`);

    console.log('Database test data cleared successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error clearing database:', err.message);
  }
}

clearTestData();
