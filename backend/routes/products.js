import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q;

  try {
    if (query) {
      const words = query.trim().split(/\s+/);
      const regexFilters = words.map(word => ({
        name: { $regex: new RegExp(word, 'i') }
      }));

      const products = await Product.find({ $and: regexFilters });
      return res.json(products);
    }

    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
