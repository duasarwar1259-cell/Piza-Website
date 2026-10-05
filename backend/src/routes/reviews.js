import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all customer reviews
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM customer_reviews ORDER BY created_at DESC LIMIT 20');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
});

// POST submit a review
router.post('/', async (req, res) => {
  try {
    const { customer_name, rating, comment, pizza_name } = req.body;
    if (!customer_name || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
    }

    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customer_name)}`;

    const result = await query(
      `INSERT INTO customer_reviews (customer_name, rating, comment, pizza_name, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [customer_name, Math.min(5, Math.max(1, parseInt(rating, 10))), comment, pizza_name || 'Artisanal Pizza', avatarUrl]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ success: false, message: 'Server error saving review' });
  }
});

export default router;
