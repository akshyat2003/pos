import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixNegativeStock() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Product.updateMany(
      { stock: { $lt: 0 } },
      { $set: { stock: 0 } }
    );
    console.log(`Updated ${result.modifiedCount} product(s) with negative stock to 0.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixNegativeStock();
