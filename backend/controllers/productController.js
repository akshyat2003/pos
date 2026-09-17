import { Product } from '../models/Product.js';

// Get all products with optional category query
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

// Get distinct categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const newProduct = await Product.create({
      name,
      category,
      price: Number(price),
      stock: stock !== undefined ? Math.max(0, parseInt(stock) || 0) : 50,
      description: description || ''
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Update an existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description } = req.body;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(category && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Math.max(0, parseInt(stock) || 0) }),
        ...(description !== undefined && { description }),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
