import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

// Place an order (Buy)
export const createOrder = async (req, res) => {
  try {
    const { user, items, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    if (!user || !user.name || !user.phone || !user.address) {
      return res.status(400).json({ message: 'Customer name, phone, and address are required' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Save or update user record in database
    let userRecord = await User.findOne({ phone: user.phone });
    if (!userRecord) {
      userRecord = await User.create({
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email || ''
      });
    } else {
      userRecord.name = user.name;
      userRecord.address = user.address;
      if (user.email) userRecord.email = user.email;
      await userRecord.save();
    }

    const newOrder = await Order.create({
      user: {
        userId: userRecord._id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email || ''
      },
      items: items.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: paymentMethod || 'Cash / Card',
      status: 'Completed'
    });

    // Deduct stock from products
    for (const item of items) {
      if (item.productId || item.id) {
        try {
          await Product.findByIdAndUpdate(item.productId || item.id, {
            $inc: { stock: -item.quantity }
          });
        } catch {
          // Ignore if invalid ID
        }
      }
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete order', error: error.message });
  }
};

// Get all orders with timestamps
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};
