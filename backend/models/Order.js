import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
      },
      name: {
        type: String,
        required: [true, 'Customer name is required']
      },
      phone: {
        type: String,
        required: [true, 'Customer phone number is required']
      },
      address: {
        type: String,
        required: [true, 'Customer address is required']
      },
      email: {
        type: String,
        default: ''
      }
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Cancelled'],
      default: 'Completed'
    },
    paymentMethod: {
      type: String,
      default: 'Cash / Card'
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
