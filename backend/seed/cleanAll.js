import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

dotenv.config();

async function cleanAll() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('No MONGO_URI in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);

    const productsDel = await Product.deleteMany({});
    const usersDel = await User.deleteMany({});
    const ordersDel = await Order.deleteMany({});

    console.log(`Deleted ${productsDel.deletedCount} products.`);
    console.log(`Deleted ${usersDel.deletedCount} users.`);
    console.log(`Deleted ${ordersDel.deletedCount} orders.`);
    console.log('MongoDB database is now 100% CLEAN and empty for manual testing!');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error cleaning database:', err.message);
  }
}

cleanAll();
