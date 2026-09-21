import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const getDatabaseStats = async (req, res) => {
  try {
    const [users, products, orders, salesAgg, recentOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalItems: { $sum: { $sum: '$items.quantity' } } } }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      counts: {
        users,
        products,
        orders,
        totalSales: Number((salesAgg[0]?.totalSales || 0).toFixed(2)),
        totalItemsSold: salesAgg[0]?.totalItems || 0
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
