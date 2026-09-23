import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map((c) => c.name));

    // 1. Ensure all products have imageUrl field and non-negative stock
    const missingImg = await db.collection('products').countDocuments({ imageUrl: { $exists: false } });
    const negativeStock = await db.collection('products').countDocuments({ stock: { $lt: 0 } });
    console.log(`Products: ${missingImg} missing imageUrl, ${negativeStock} with negative stock.`);

    if (missingImg > 0) {
      const res = await db.collection('products').updateMany(
        { imageUrl: { $exists: false } },
        { $set: { imageUrl: '' } }
      );
      console.log(`Updated ${res.modifiedCount} product(s) to have imageUrl field.`);
    }

    if (negativeStock > 0) {
      const res = await db.collection('products').updateMany(
        { stock: { $lt: 0 } },
        { $set: { stock: 0 } }
      );
      console.log(`Fixed ${res.modifiedCount} product(s) with negative stock.`);
    }

    // 2. Ensure all sessions have lastActiveAt field
    const missingLastActive = await db.collection('sessions').countDocuments({ lastActiveAt: { $exists: false } });
    console.log(`Sessions: ${missingLastActive} missing lastActiveAt.`);

    if (missingLastActive > 0) {
      const res = await db.collection('sessions').updateMany(
        { lastActiveAt: { $exists: false } },
        [{ $set: { lastActiveAt: { $ifNull: ['$createdAt', new Date()] } } }]
      );
      console.log(`Updated ${res.modifiedCount} session(s) with lastActiveAt.`);
    }

    // 3. Mark stale / idle sessions older than 15 mins as invalid
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const staleSessions = await db.collection('sessions').updateMany(
      {
        isValid: true,
        $or: [
          { lastActiveAt: { $lt: fifteenMinsAgo } },
          { expiresAt: { $lt: new Date() } }
        ]
      },
      { $set: { isValid: false } }
    );
    console.log(`Invalidated ${staleSessions.modifiedCount} stale session(s).`);

    // 4. Summarize current counts
    const prodCount = await db.collection('products').countDocuments();
    const userCount = await db.collection('users').countDocuments();
    const orderCount = await db.collection('orders').countDocuments();
    const activeSessions = await db.collection('sessions').countDocuments({ isValid: true });

    console.log('--- Database Status Summary ---');
    console.log(`Active Products: ${prodCount}`);
    console.log(`Registered Users: ${userCount}`);
    console.log(`Recorded Orders: ${orderCount}`);
    console.log(`Active Sessions: ${activeSessions}`);

    await mongoose.disconnect();
    console.log('Database migration & cleanup completed successfully.');
  } catch (err) {
    console.error('Error during database update:', err);
    process.exit(1);
  }
}

updateDatabase();
