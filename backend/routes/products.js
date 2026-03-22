const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/products — public, in-stock only
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM products WHERE in_stock = true';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY category, sort_order';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/all — admin, includes out-of-stock
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY category, sort_order');
    res.json(rows);
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/products/:id — admin
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { in_stock, price } = req.body;
    const sets = [];
    const params = [];

    if (in_stock !== undefined) {
      params.push(in_stock);
      sets.push(`in_stock = $${params.length}`);
    }
    if (price !== undefined) {
      params.push(price);
      sets.push(`price = $${params.length}`);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`;
    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
