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

    // Check stock availability for all products before placing order
    for (const item of items) {
      const prodId = item.productId || item.id;
      if (prodId) {
        const prod = await Product.findById(prodId);
        if (prod) {
          if (prod.stock <= 0) {
            return res.status(400).json({
              message: `"${prod.name}" is out of stock.`
            });
          }
          if (prod.stock < item.quantity) {
            return res.status(400).json({
              message: `Cannot order ${item.quantity} units of "${prod.name}". Only ${prod.stock} unit(s) available.`
            });
          }
        }
      }
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
        category: item.category || '',
        price: Number(item.price),
        quantity: Number(item.quantity),
        subtotal: Number((Number(item.price) * Number(item.quantity)).toFixed(2)),
        description: item.description || ''
      })),
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: paymentMethod || 'Cash / Card',
      status: 'Completed'
    });

    // Deduct stock safely (never drop below 0)
    for (const item of items) {
      const prodId = item.productId || item.id;
      if (prodId) {
        const prod = await Product.findById(prodId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          await prod.save();
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
