const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// All admin routes require authentication
router.use(auth);

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = 'SELECT * FROM orders';
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (date) {
      params.push(date);
      conditions.push(`DATE(created_at) = $${params.length}::date`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    const { rows: orders } = await pool.query(query, params);

    // Attach items to each order
    for (const order of orders) {
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/orders/:id
router.patch('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Attach items
    const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    res.json({ ...rows[0], items });
  } catch (err) {
    console.error('Admin update order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/revenue
router.get('/revenue', async (req, res) => {
  try {
    const [todayResult, dailyResult, topResult] = await Promise.all([
      pool.query('SELECT * FROM today_summary'),
      pool.query('SELECT * FROM daily_revenue LIMIT 30'),
      pool.query('SELECT * FROM top_products LIMIT 5'),
    ]);

    res.json({
      today: todayResult.rows[0],
      daily: dailyResult.rows,
      topProducts: topResult.rows,
    });
  } catch (err) {
    console.error('Admin revenue error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM booking_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/bookings/:id
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { rows } = await pool.query(
      'UPDATE booking_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Admin update booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
