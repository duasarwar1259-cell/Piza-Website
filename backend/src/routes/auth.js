import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { signToken } from '../utils/jwt.js';
import { registerSchema, loginSchema, validate } from '../validators/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register (Validated with Yup, Tokens with Jose)
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default to customer role unless explicitly seeded or designated
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const insertSql = `
      INSERT INTO users (name, email, password_hash, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, address, role, created_at;
    `;

    const result = await query(insertSql, [name, email.toLowerCase(), passwordHash, phone || null, address || null, userRole]);
    const newUser = result.rows[0];

    // Sign JWT using Jose
    const token = await signToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login (Validated with Yup, Tokens with Jose)
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = userRes.rows[0];

    // Compare bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Sign JWT using Jose
    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
    };

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/me (Protected Route via Jose JWT)
router.get('/me', authenticate, async (req, res) => {
  try {
    const userRes = await query(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: userRes.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/my-orders (Protected Route)
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const ordersRes = await query(
      `SELECT * FROM orders 
       WHERE user_id = $1 OR LOWER(customer_email) = LOWER($2)
       ORDER BY created_at DESC`,
      [req.user.id, req.user.email]
    );

    const orders = ordersRes.rows;
    for (const ord of orders) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC', [ord.id]);
      ord.items = itemsRes.rows;
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('User orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your orders' });
  }
});

export default router;
