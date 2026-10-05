import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all menu customization options: categories, sizes, crusts, toppings
router.get('/', async (req, res) => {
  try {
    const [categoriesRes, sizesRes, crustsRes, toppingsRes] = await Promise.all([
      query('SELECT * FROM categories ORDER BY display_order ASC, id ASC'),
      query('SELECT * FROM sizes ORDER BY price_multiplier ASC'),
      query('SELECT * FROM crusts ORDER BY extra_price ASC'),
      query('SELECT * FROM toppings ORDER BY category ASC, name ASC')
    ]);

    res.json({
      success: true,
      data: {
        categories: categoriesRes.rows,
        sizes: sizesRes.rows,
        crusts: crustsRes.rows,
        toppings: toppingsRes.rows
      }
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    res.status(500).json({ success: false, message: 'Server error fetching customization options' });
  }
});

// GET categories only
router.get('/categories', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY display_order ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

// GET sizes only
router.get('/sizes', async (req, res) => {
  try {
    const result = await query('SELECT * FROM sizes ORDER BY price_multiplier ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sizes' });
  }
});

// GET crusts only
router.get('/crusts', async (req, res) => {
  try {
    const result = await query('SELECT * FROM crusts ORDER BY extra_price ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching crusts' });
  }
});

// GET toppings only
router.get('/toppings', async (req, res) => {
  try {
    const result = await query('SELECT * FROM toppings ORDER BY category ASC, name ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching toppings' });
  }
});

export default router;
