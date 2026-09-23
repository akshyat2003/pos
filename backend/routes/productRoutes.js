import express from 'express';
import * as c from '../controllers/productController.js';
const router = express.Router();
router.get('/', c.getProducts);
router.get('/categories', c.getCategories);
router.post('/', c.createProduct);
router.put('/:id', c.updateProduct);
router.delete('/:id', c.deleteProduct);
export default router;
