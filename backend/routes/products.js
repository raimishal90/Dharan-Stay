const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const VALID_CATEGORIES = ['Staples', 'Fresh', 'Spices', 'Drinks', 'Snacks', 'Meal Kit'];

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

// POST /api/products — admin, create new product
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, icon, badge, description, ingredients, sort_order } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    const query = `
      INSERT INTO products (name, category, price, icon, badge, description, ingredients, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [
      name.trim(),
      category,
      parseInt(price),
      icon || null,
      badge || null,
      description || null,
      ingredients && ingredients.length > 0 ? ingredients : null,
      sort_order || 0,
    ];

    const { rows } = await pool.query(query, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/products/:id — admin, update product fields
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { in_stock, price, name, category, icon, badge, description, ingredients, sort_order } = req.body;
    const sets = [];
    const params = [];

    if (in_stock !== undefined) {
      params.push(in_stock);
      sets.push(`in_stock = $${params.length}`);
    }
    if (price !== undefined) {
      params.push(parseInt(price));
      sets.push(`price = $${params.length}`);
    }
    if (name !== undefined) {
      params.push(name.trim());
      sets.push(`name = $${params.length}`);
    }
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      params.push(category);
      sets.push(`category = $${params.length}`);
    }
    if (icon !== undefined) {
      params.push(icon);
      sets.push(`icon = $${params.length}`);
    }
    if (badge !== undefined) {
      params.push(badge || null);
      sets.push(`badge = $${params.length}`);
    }
    if (description !== undefined) {
      params.push(description || null);
      sets.push(`description = $${params.length}`);
    }
    if (ingredients !== undefined) {
      params.push(ingredients && ingredients.length > 0 ? ingredients : null);
      sets.push(`ingredients = $${params.length}`);
    }
    if (sort_order !== undefined) {
      params.push(parseInt(sort_order));
      sets.push(`sort_order = $${params.length}`);
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

// DELETE /api/products/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
