import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const initialProducts = [
  // Beverages
  { name: 'Dark Roast Espresso', category: 'Beverages', price: 3.99, stock: 60, description: 'Rich and bold single-origin espresso shot' },
  { name: 'Iced Caramel Macchiato', category: 'Beverages', price: 5.49, stock: 45, description: 'Fresh espresso with vanilla and caramel drizzle' },
  { name: 'Matcha Green Tea Latte', category: 'Beverages', price: 5.25, stock: 35, description: 'Japanese ceremonial grade matcha with steamed milk' },
  { name: 'Sparkling Mineral Water', category: 'Beverages', price: 2.50, stock: 80, description: 'Naturally carbonated spring water' },
  
  // Bakery
  { name: 'Butter Croissant', category: 'Bakery', price: 3.50, stock: 30, description: 'Flaky French golden pastry' },
  { name: 'Blueberry Muffin', category: 'Bakery', price: 3.25, stock: 25, description: 'Fresh oven-baked muffin with wild blueberries' },
  { name: 'Cinnamon Swirl Roll', category: 'Bakery', price: 4.20, stock: 20, description: 'Warm cinnamon roll with cream cheese glaze' },

  // Food & Snacks
  { name: 'Avocado Toast & Egg', category: 'Food', price: 8.99, stock: 20, description: 'Sourdough toast with fresh avocado and poached egg' },
  { name: 'Smoked Turkey Club Sandwich', category: 'Food', price: 9.50, stock: 15, description: 'Triple decker sandwich with greens and aioli' },
  { name: 'Sea Salt Kettle Chips', category: 'Snacks', price: 2.25, stock: 50, description: 'Crunchy artisan potato chips' },

  // Electronics / Gadgets
  { name: 'Wireless Bluetooth Earbuds', category: 'Electronics', price: 49.99, stock: 18, description: 'Noise cancelling portable wireless earbuds' },
  { name: 'USB-C Fast Charging Cable', category: 'Electronics', price: 12.99, stock: 40, description: 'Braided 6ft durable power delivery cable' },
  { name: 'Magnetic Phone Stand', category: 'Accessories', price: 19.50, stock: 25, description: 'Adjustable aluminium desk stand for smartphones' }
];

export const initialUsers = [
  { name: 'Alex Johnson', email: 'alex.j@example.com', phone: '+1-555-0101' },
  { name: 'Sarah Miller', email: 'sarah.m@example.com', phone: '+1-555-0102' },
  { name: 'David Chen', email: 'david.c@example.com', phone: '+1-555-0103' }
];

export const seedDatabaseIfEmpty = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      console.log(`Seeded ${initialProducts.length} default products`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(initialUsers);
      console.log(`Seeded ${initialUsers.length} default users`);
    }
  } catch (err) {
    console.error(`Seed check: ${err.message}`);
  }
};
