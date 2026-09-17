import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const getDatabaseStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    // Aggregate total sales
    const salesAgg = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalItemsBought: { $sum: { $sum: '$items.quantity' } } } }
    ]);

    const totalSales = salesAgg[0]?.totalSales || 0;
    const totalItemsSold = salesAgg[0]?.totalItemsBought || 0;

    // Recent orders with timestamps
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      counts: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        totalSales: Number(totalSales.toFixed(2)),
        totalItemsSold
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database statistics', error: error.message });
  }
};
