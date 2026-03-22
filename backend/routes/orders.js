const router = require('express').Router();
const pool = require('../db');
const whatsapp = require('../services/whatsapp');

// POST /api/orders
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { guest_name, guest_phone, room_number, payment_method, delivery_pref, notes, items } = req.body;

    // Validation
    if (!guest_name || !guest_name.trim()) {
      return res.status(400).json({ error: 'Guest name is required' });
    }
    if (!guest_phone || !guest_phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    if (!payment_method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    await client.query('BEGIN');

    // Generate order ID
    const { rows: idRows } = await client.query('SELECT next_order_id() AS id');
    const orderId = idRows[0].id;

    // Calculate total
    const orderItems = items.map(i => ({
      ...i,
      subtotal: i.price * i.quantity,
    }));
    const total_amount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

    // Insert order
    await client.query(
      `INSERT INTO orders (id, guest_name, guest_phone, room_number, payment_method, delivery_pref, status, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'placed', $7, $8)`,
      [orderId, guest_name.trim(), guest_phone.trim(), room_number || null, payment_method, delivery_pref || 'asap', total_amount, notes || null]
    );

    // Insert items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.product_id || null, item.name, item.price, item.quantity, item.subtotal]
      );
    }

    await client.query('COMMIT');

    // Send WhatsApp notification (don't fail order if this fails)
    try {
      const order = {
        id: orderId,
        guest_name: guest_name.trim(),
        guest_phone: guest_phone.trim(),
        room_number,
        payment_method,
        delivery_pref: delivery_pref || 'asap',
        total_amount,
        items: orderItems,
        created_at: new Date(),
      };
      await whatsapp.sendOrderNotification(order);
      await pool.query('UPDATE orders SET wa_sent = true WHERE id = $1', [orderId]);
    } catch (waErr) {
      console.error('WhatsApp notification failed:', waErr.message);
    }

    res.status(201).json({ orderId, status: 'placed', total_amount });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id.toUpperCase()]);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id.toUpperCase()]);

    res.json({ ...orderRows[0], items: itemRows });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/by-phone/:phone
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE guest_phone = $1 ORDER BY created_at DESC LIMIT 10',
      [phone]
    );

    // Attach items to each order
    for (const order of orders) {
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Get orders by phone error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
