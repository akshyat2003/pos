import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const createOrder = async (req, res) => {
  try {
    const { user, items, paymentMethod } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Cart items cannot be empty' });
    if (!user?.name || !user?.phone || !user?.address) return res.status(400).json({ message: 'Customer name, phone, and address are required' });

    for (const item of items) {
      const prod = await Product.findById(item.productId || item.id);
      if (prod && (prod.stock <= 0 || prod.stock < item.quantity)) {
        return res.status(400).json({ message: `Insufficient stock for "${prod.name}" (available: ${prod.stock})` });
      }
    }

    const email = (user.email || '').trim().toLowerCase();
    const phone = user.phone.trim();
    let userDoc = (user.userId && await User.findById(user.userId)) || (email && await User.findOne({ email })) || (await User.findOne({ phone }));

    if (!userDoc) {
      userDoc = await User.create({ name: user.name.trim(), phone, address: user.address.trim(), email });
    } else {
      Object.assign(userDoc, { name: user.name.trim(), phone, address: user.address.trim() });
      await userDoc.save();
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = await Order.create({
      user: { userId: userDoc._id, name: user.name, phone: user.phone, address: user.address, email },
      items: items.map(i => ({
        productId: i.productId || i.id, name: i.name, category: i.category || '',
        price: Number(i.price), quantity: Number(i.quantity),
        subtotal: Number((i.price * i.quantity).toFixed(2)), description: i.description || ''
      })),
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: paymentMethod || 'Cash / Card',
      status: 'Completed'
    });

    await Promise.all(items.map(async (i) => {
      const p = await Product.findById(i.productId || i.id);
      if (p) { p.stock = Math.max(0, p.stock - i.quantity); await p.save(); }
    }));

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getOrders = async (req, res) => {
  try { res.json(await Order.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
