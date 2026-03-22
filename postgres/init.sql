-- ============================================================
-- Dharan Stays — Database Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  name_ne     TEXT,
  name_hi     TEXT,
  category    TEXT NOT NULL CHECK (category IN ('Staples','Fresh','Spices','Drinks','Snacks','Meal Kit')),
  price       INTEGER NOT NULL CHECK (price > 0),
  icon        TEXT,
  badge       TEXT,
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  ingredients TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category   ON products (category);
CREATE INDEX idx_products_in_stock   ON products (in_stock);
CREATE INDEX idx_products_sort_order ON products (sort_order);

-- Order ID sequence
CREATE SEQUENCE order_seq START 1;

CREATE OR REPLACE FUNCTION next_order_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'DHR-' || LPAD(nextval('order_seq')::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE orders (
  id              TEXT PRIMARY KEY,
  guest_name      TEXT NOT NULL,
  guest_phone     TEXT NOT NULL,
  room_number     TEXT,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('esewa','khalti','cash','checkout')),
  delivery_pref   TEXT CHECK (delivery_pref IN ('asap','1hour','tomorrow')),
  status          TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','preparing','ready','delivered','cancelled')),
  total_amount    INTEGER NOT NULL CHECK (total_amount > 0),
  paid            BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  wa_sent         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_phone      ON orders (guest_phone);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  subtotal    INTEGER NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

CREATE TABLE booking_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name    TEXT NOT NULL,
  guest_phone   TEXT NOT NULL,
  guest_email   TEXT,
  checkin_date  DATE NOT NULL,
  checkout_date DATE NOT NULL CHECK (checkout_date > checkin_date),
  guest_count   INTEGER CHECK (guest_count BETWEEN 1 AND 10),
  purpose       TEXT,
  requests      TEXT,
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled')),
  wa_sent       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_status     ON booking_requests (status);
CREATE INDEX idx_bookings_checkin    ON booking_requests (checkin_date);
CREATE INDEX idx_bookings_created_at ON booking_requests (created_at DESC);

CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW daily_revenue AS
SELECT
  DATE(created_at) AS date,
  COUNT(*)::INTEGER AS total_orders,
  SUM(total_amount)::INTEGER AS gross_revenue,
  (SUM(total_amount) * 0.5)::INTEGER AS est_restock_cost,
  (SUM(total_amount) * 0.5)::INTEGER AS est_net_profit
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW top_products AS
SELECT
  oi.name,
  SUM(oi.quantity)::INTEGER AS total_qty,
  SUM(oi.subtotal)::INTEGER AS total_revenue
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY oi.name
ORDER BY total_revenue DESC;

CREATE OR REPLACE VIEW today_summary AS
SELECT
  COUNT(*)::INTEGER AS orders_today,
  COUNT(*) FILTER (WHERE status IN ('placed','preparing','ready'))::INTEGER AS pending,
  COUNT(*) FILTER (WHERE status = 'delivered')::INTEGER AS delivered_today,
  COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0)::INTEGER AS revenue_today
FROM orders
WHERE DATE(created_at) = CURRENT_DATE;
