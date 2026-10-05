import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all pizzas with optional filters (category, search, dietary, sort)
router.get('/', async (req, res) => {
  try {
    const { category, search, veg, spicy, bestseller, sort } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM pizzas p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = true
    `;
    const params = [];
    let paramIndex = 1;

    if (category && category !== 'all') {
      sql += ` AND c.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (veg === 'true') {
      sql += ` AND p.is_veg = true`;
    }

    if (spicy === 'true') {
      sql += ` AND p.is_spicy = true`;
    }

    if (bestseller === 'true') {
      sql += ` AND p.is_bestseller = true`;
    }

    if (sort === 'price_asc') {
      sql += ` ORDER BY p.base_price ASC`;
    } else if (sort === 'price_desc') {
      sql += ` ORDER BY p.base_price DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY p.rating DESC, p.reviews_count DESC`;
    } else {
      sql += ` ORDER BY p.is_bestseller DESC, p.id ASC`;
    }

    const result = await query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pizzas' });
  }
});

// GET pizza by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNum = !isNaN(Number(idOrSlug));

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM pizzas p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isNum ? 'p.id = $1' : 'p.slug = $1'}
    `;
    const result = await query(sql, [idOrSlug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching pizza:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST add new pizza
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
      image_url,
      base_price,
      prep_time = '15-20 mins',
      calories = 750,
      is_veg = false,
      is_spicy = false,
      is_bestseller = false,
      ingredients = []
    } = req.body;

    if (!name || !description || !base_price) {
      return res.status(400).json({ success: false, message: 'Missing required pizza fields' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const insertSql = `
      INSERT INTO pizzas 
      (category_id, name, slug, description, image_url, base_price, prep_time, calories, is_veg, is_spicy, is_bestseller, ingredients)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      category_id || 1,
      name,
      slug,
      description,
      image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      base_price,
      prep_time,
      calories,
      Boolean(is_veg),
      Boolean(is_spicy),
      Boolean(is_bestseller),
      Array.isArray(ingredients) ? ingredients : []
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding pizza:', error);
    res.status(500).json({ success: false, message: 'Failed to add pizza' });
  }
});

// PUT update pizza
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      description,
      image_url,
      base_price,
      prep_time,
      calories,
      is_veg,
      is_spicy,
      is_bestseller,
      is_available
    } = req.body;

    const updateSql = `
      UPDATE pizzas
      SET name = COALESCE($1, name),
          category_id = COALESCE($2, category_id),
          description = COALESCE($3, description),
          image_url = COALESCE($4, image_url),
          base_price = COALESCE($5, base_price),
          prep_time = COALESCE($6, prep_time),
          calories = COALESCE($7, calories),
          is_veg = COALESCE($8, is_veg),
          is_spicy = COALESCE($9, is_spicy),
          is_bestseller = COALESCE($10, is_bestseller),
          is_available = COALESCE($11, is_available)
      WHERE id = $12
      RETURNING *;
    `;

    const result = await query(updateSql, [
      name, category_id, description, image_url, base_price,
      prep_time, calories, is_veg, is_spicy, is_bestseller, is_available, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating pizza:', error);
    res.status(500).json({ success: false, message: 'Server error updating pizza' });
  }
});

// DELETE pizza
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM pizzas WHERE id = $1 RETURNING id;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }
    res.json({ success: true, message: 'Pizza deleted successfully' });
  } catch (error) {
    console.error('Error deleting pizza:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
