import express from 'express';
import { query } from '../db/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin authorization to all admin endpoints
router.use(authenticate, requireAdmin);

// GET all orders with items and filtering
router.get('/orders', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let sql = 'SELECT * FROM orders';
    const params = [];

    if (status && status !== 'all') {
      sql += ' WHERE order_status = $1';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit, 10));

    const ordersRes = await query(sql, params);
    const orders = ordersRes.rows;

    // Attach items to each order
    for (const ord of orders) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC', [ord.id]);
      ord.items = itemsRes.rows;
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

// PATCH update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const validStatuses = ['received', 'preparing', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    let sql = `
      UPDATE orders
      SET order_status = COALESCE($1, order_status),
          payment_status = COALESCE($2, payment_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;

    const result = await query(sql, [status, payment_status, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updated = result.rows[0];
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [updated.id]);
    updated.items = itemsRes.rows;

    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// GET analytics dashboard
router.get('/analytics', async (req, res) => {
  try {
    // Total revenue & counts
    const statsRes = await query(`
      SELECT 
        COUNT(*)::int as total_orders,
        COALESCE(SUM(total_amount), 0)::numeric as total_revenue,
        COUNT(*) FILTER (WHERE order_status NOT IN ('delivered', 'cancelled'))::int as active_orders,
        COUNT(*) FILTER (WHERE order_status = 'delivered')::int as delivered_orders,
        COUNT(*) FILTER (WHERE order_status = 'cancelled')::int as cancelled_orders,
        COALESCE(AVG(total_amount), 0)::numeric as avg_order_value
      FROM orders;
    `);

    // Top selling pizzas
    const topPizzasRes = await query(`
      SELECT pizza_name, SUM(quantity)::int as total_sold, SUM(total_price)::numeric as total_revenue
      FROM order_items
      GROUP BY pizza_name
      ORDER BY total_sold DESC
      LIMIT 5;
    `);

    // Recent orders
    const recentOrdersRes = await query(`
      SELECT id, order_number, customer_name, total_amount, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    res.json({
      success: true,
      data: {
        stats: statsRes.rows[0],
        top_pizzas: topPizzasRes.rows,
        recent_orders: recentOrdersRes.rows
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
});

// PATCH toggle pizza availability
router.patch('/pizzas/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const result = await query(
      'UPDATE pizzas SET is_available = $1 WHERE id = $2 RETURNING *',
      [Boolean(is_available), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
