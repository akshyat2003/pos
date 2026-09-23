import express from 'express';
import { imagekit } from '../config/imagekit.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/image', protect, adminOnly, async (req, res) => {
  try {
    const { image, fileName } = req.body;
    if (!image) return res.status(400).json({ message: 'Image data is required' });

    const cleanName = (fileName || `prod_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const result = await imagekit.upload({
      file: image,
      fileName: /\.(jpg|jpeg|png|webp|gif)$/i.test(cleanName) ? cleanName : `${cleanName}.jpg`,
      folder: '/pos-products',
    });

    res.json({ url: result.url, fileId: result.fileId, thumbnailUrl: result.thumbnailUrl });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});

export default router;
