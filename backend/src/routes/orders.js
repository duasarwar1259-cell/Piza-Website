import express from 'express';
import pool, { query } from '../db/index.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { createOrderSchema } from '../validators/order.js';
import { validate } from '../validators/auth.js';

const router = express.Router();

// Helper to generate readable random order numbers
function generateOrderNumber() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${randomNum}`;
}

// POST create new order (Validated with Yup, tracks user if authenticated)
router.post('/', optionalAuthenticate, validate(createOrderSchema), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      order_type = 'delivery',
      delivery_address,
      instructions = '',
      payment_method = 'cash',
      items = [],
      promo_code = ''
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({ success: false, message: 'Please provide customer name, email, and phone' });
    }

    if (order_type === 'delivery' && !delivery_address) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for delivery orders' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    await client.query('BEGIN');

    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      const q = item.quantity || 1;
      const unit = parseFloat(item.unit_price) || 0;
      subtotal += unit * q;
    }
    subtotal = Math.round(subtotal * 100) / 100;

    // Apply promo discounts
    let discount = 0;
    if (promo_code) {
      const upper = promo_code.trim().toUpperCase();
      if (upper === 'PIZZA20') {
        discount = Math.round(subtotal * 0.20 * 100) / 100;
      } else if (upper === 'SLICELOVE' || upper === 'SAVE5') {
        discount = Math.min(5.00, subtotal);
      } else if (upper === 'FREESHIP') {
        discount = 0; // handled in delivery fee
      }
    }

    // Delivery fee logic
    let delivery_fee = 0;
    if (order_type === 'delivery') {
      if (promo_code && promo_code.trim().toUpperCase() === 'FREESHIP') {
        delivery_fee = 0;
      } else if (subtotal - discount >= 35.00) {
        delivery_fee = 0; // Free delivery for orders $35+
      } else {
        delivery_fee = 2.99;
      }
    }

    // Tax (approx 8%)
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
    const total_amount = Math.round((taxableAmount + delivery_fee + tax) * 100) / 100;

    const orderNumber = generateOrderNumber();
    const estDelivery = order_type === 'pickup' ? '15-20 mins' : '30-40 mins';

    // Insert order (linking user_id if logged in)
    const orderSql = `
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone, order_type,
        delivery_address, instructions, subtotal, discount, delivery_fee, tax,
        total_amount, payment_method, payment_status, order_status, estimated_delivery_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;

    const paymentStatus = (payment_method === 'card' || payment_method === 'online') ? 'paid' : 'pending';
    const userId = req.user?.id || null;

    const orderRes = await client.query(orderSql, [
      orderNumber,
      userId,
      customer_name,
      customer_email,
      customer_phone,
      order_type,
      delivery_address || 'Store Pickup',
      instructions,
      subtotal,
      discount,
      delivery_fee,
      tax,
      total_amount,
      payment_method,
      paymentStatus,
      'received',
      estDelivery
    ]);

    const createdOrder = orderRes.rows[0];

    // Insert order items
    for (const item of items) {
      const q = item.quantity || 1;
      const unit = parseFloat(item.unit_price) || 0;
      const totalItem = Math.round(unit * q * 100) / 100;

      await client.query(
        `INSERT INTO order_items (
          order_id, pizza_id, pizza_name, size_name, crust_name, toppings, special_notes, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          createdOrder.id,
          item.pizza_id || null,
          item.pizza_name || 'Custom Pizza',
          item.size_name || 'Medium (10")',
          item.crust_name || 'Classic Stone-Baked',
          JSON.stringify(item.toppings || []),
          item.special_notes || '',
          q,
          unit,
          totalItem
        ]
      );
    }

    await client.query('COMMIT');

    // Retrieve full order with items
    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [createdOrder.id]);
    createdOrder.items = itemsRes.rows;

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      data: createdOrder
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server error processing order' });
  } finally {
    client.release();
  }
});

// GET order by order_number for live tracking
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const orderRes = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber.toUpperCase()]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found with that reference number' });
    }

    const order = orderRes.rows[0];
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC', [order.id]);
    order.items = itemsRes.rows;

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, message: 'Server error tracking order' });
  }
});

// GET user orders by phone or email
router.get('/', async (req, res) => {
  try {
    const { email, phone } = req.query;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Provide email or phone to search past orders' });
    }

    let sql = 'SELECT * FROM orders WHERE customer_email ILIKE $1 OR customer_phone = $2 ORDER BY created_at DESC LIMIT 10';
    const result = await query(sql, [email || '', phone || '']);

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error finding user orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
