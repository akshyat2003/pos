import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
  description: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, default: '' }
  },
  items: [itemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Cancelled'], default: 'Completed' },
  paymentMethod: { type: String, default: 'Cash / Card' }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
