import { Product } from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const filter = req.query.category && req.query.category !== 'All' ? { category: req.query.category } : {};
    res.json(await Product.find(filter).sort({ category: 1, name: 1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getCategories = async (req, res) => {
  try { res.json(await Product.distinct('category')); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }
    const product = await Product.create({
      name: name.trim(), category, price: Number(price),
      stock: stock !== undefined ? Math.max(0, parseInt(stock) || 0) : 50,
      description: description ? description.trim() : ''
    });
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!await Product.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
