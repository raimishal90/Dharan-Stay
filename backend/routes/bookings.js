const router = require('express').Router();
const pool = require('../db');
const whatsapp = require('../services/whatsapp');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { guest_name, guest_phone, guest_email, checkin_date, checkout_date, guest_count, purpose, requests } = req.body;

    // Validation
    if (!guest_name || !guest_name.trim()) {
      return res.status(400).json({ error: 'Guest name is required' });
    }
    if (!guest_phone || !guest_phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!checkin_date) {
      return res.status(400).json({ error: 'Check-in date is required' });
    }
    if (!checkout_date) {
      return res.status(400).json({ error: 'Check-out date is required' });
    }
    if (new Date(checkout_date) <= new Date(checkin_date)) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const { rows } = await pool.query(
      `INSERT INTO booking_requests (guest_name, guest_phone, guest_email, checkin_date, checkout_date, guest_count, purpose, requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, status`,
      [guest_name.trim(), guest_phone.trim(), guest_email || null, checkin_date, checkout_date, guest_count || null, purpose || null, requests || null]
    );

    // Send WhatsApp notification
    try {
      await whatsapp.sendBookingNotification({
        guest_name: guest_name.trim(),
        guest_phone: guest_phone.trim(),
        checkin_date,
        checkout_date,
        guest_count,
        purpose,
        requests,
      });
      await pool.query('UPDATE booking_requests SET wa_sent = true WHERE id = $1', [rows[0].id]);
    } catch (waErr) {
      console.error('WhatsApp booking notification failed:', waErr.message);
    }

    res.status(201).json({ id: rows[0].id, status: rows[0].status });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
