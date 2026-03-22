-- ============================================================
-- Dharan Stays — Seed Data
-- ============================================================

-- Settings
INSERT INTO settings (key, value) VALUES
  ('host_whatsapp', '+977XXXXXXXXXX'),
  ('nightly_rate_npr', '2100'),
  ('delivery_fee_npr', '0'),
  ('delivery_eta_min', '45');

-- Admin user (password: admin123)
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@dharanstays.com', '$2b$10$ol7iVbMXa7S7ixC8yZobaOgRPcL99VttkIIV6IcbYow2cns3iUyrO');

-- ============================================================
-- PRODUCTS — Staples (15)
-- ============================================================
INSERT INTO products (name, category, price, icon, sort_order) VALUES
  ('Basmati Rice 1 kg',       'Staples', 160, '🍚', 1),
  ('Masoor Daal 500 g',       'Staples', 120, '🫘', 2),
  ('Wai Wai Noodles ×5',      'Staples', 180, '🍜', 3),
  ('Ramen / Maggi Pack',      'Staples',  55, '🍜', 4),
  ('Bread Loaf medium',       'Staples',  90, '🍞', 5),
  ('Mustard Oil 200 ml',      'Staples', 130, '🫗', 6),
  ('Sunflower Oil 200 ml',    'Staples', 120, '🫗', 7),
  ('Ghee 100 g',              'Staples', 240, '🧈', 8),
  ('Sugar 500 g',             'Staples',  90, '🍬', 9),
  ('Salt 200 g',              'Staples',  50, '🧂', 10),
  ('Sattu 100 g',             'Staples', 100, '🫙', 11),
  ('Beaten Rice / Chiura 200 g','Staples', 75, '🍚', 12),
  ('Mixed Daal Pack',         'Staples', 180, '🫘', 13),
  ('Oats 500 g',              'Staples', 180, '🥣', 14),
  ('Muesli / Cornflakes',     'Staples', 240, '🥣', 15);

UPDATE products SET badge = 'Local'  WHERE name = 'Sattu 100 g';
UPDATE products SET badge = 'Bundle' WHERE name = 'Mixed Daal Pack';

-- ============================================================
-- PRODUCTS — Fresh (16)
-- ============================================================
INSERT INTO products (name, category, price, icon, badge, sort_order) VALUES
  ('Eggs ×6',                  'Fresh', 210, '🥚', 'Daily fresh', 1),
  ('Eggs full tray ×30',       'Fresh', 900, '🥚', NULL, 2),
  ('Fresh Milk 500 ml',        'Fresh', 100, '🥛', 'Daily fresh', 3),
  ('Curd / Yoghurt 200 g',    'Fresh',  90, '🥛', NULL, 4),
  ('Paneer 200 g',             'Fresh', 220, '🧀', NULL, 5),
  ('Butter 100 g Amul',        'Fresh', 130, '🧈', NULL, 6),
  ('Onion 500 g',              'Fresh',  70, '🧅', NULL, 7),
  ('Tomato 500 g',             'Fresh',  80, '🍅', NULL, 8),
  ('Potato 500 g',             'Fresh',  75, '🥔', NULL, 9),
  ('Garlic bulb 3 pc',         'Fresh',  40, '🧄', NULL, 10),
  ('Ginger 50 g',              'Fresh',  40, '🫚', NULL, 11),
  ('Green Chilli 50 g',        'Fresh',  35, '🌶️', NULL, 12),
  ('Spinach / Saag bunch',     'Fresh',  70, '🥬', 'Daily fresh', 13),
  ('Banana bunch ×5',          'Fresh',  70, '🍌', NULL, 14),
  ('Seasonal Fruit Pack',      'Fresh', 130, '🍎', NULL, 15),
  ('Lemon ×5',                 'Fresh',  50, '🍋', NULL, 16);

-- ============================================================
-- PRODUCTS — Spices (13)
-- ============================================================
INSERT INTO products (name, category, price, icon, badge, sort_order) VALUES
  ('Turmeric Powder 50 g',     'Spices',  50, '🟡', NULL, 1),
  ('Red Chilli Powder 50 g',   'Spices',  50, '🌶️', NULL, 2),
  ('Cumin Powder 50 g',        'Spices',  55, '🫙', NULL, 3),
  ('Coriander Powder 50 g',    'Spices',  50, '🫙', NULL, 4),
  ('Garam Masala 50 g',        'Spices',  80, '🫙', NULL, 5),
  ('Nepali Masala local',      'Spices', 100, '🫙', 'Local', 6),
  ('Complete Spice Kit 7 pc',  'Spices', 380, '🎁', 'Bundle', 7),
  ('Local Achaar Jar',         'Spices', 160, '🫙', 'Local', 8),
  ('Tomato Ketchup 200 g',    'Spices', 160, '🍅', NULL, 9),
  ('Soy Sauce 100 ml',        'Spices', 110, '🫗', NULL, 10),
  ('Chilli Sauce small',      'Spices', 120, '🌶️', NULL, 11),
  ('Vinegar 100 ml',          'Spices',  70, '🫗', NULL, 12),
  ('Instant Curry Paste sachet','Spices', 70, '🍛', NULL, 13);

-- ============================================================
-- PRODUCTS — Drinks (6)
-- ============================================================
INSERT INTO products (name, category, price, icon, badge, sort_order) VALUES
  ('Nescafé Sachets ×5',       'Drinks', 150, '☕', 'Popular', 1),
  ('Tea Bags ×25 Wagh Bakri',  'Drinks', 160, '🍵', NULL, 2),
  ('Water Bottle 1 L',         'Drinks',  50, '💧', NULL, 3),
  ('Coca-Cola / Sprite 300 ml','Drinks',  90, '🥤', NULL, 4),
  ('Nimbu Pani Sachets ×5',    'Drinks',  80, '🍋', NULL, 5),
  ('Tongba Mix Kit',           'Drinks', 200, '🍺', 'Local', 6);

-- ============================================================
-- PRODUCTS — Snacks (5)
-- ============================================================
INSERT INTO products (name, category, price, icon, badge, sort_order) VALUES
  ('Sel Roti fresh local',     'Snacks',  80, '🍩', 'Local', 1),
  ('Biscuit Assortment Pack',  'Snacks', 130, '🍪', NULL, 2),
  ('Popcorn Kernels 200 g',   'Snacks',  90, '🍿', NULL, 3),
  ('Parle-G Biscuits pack',   'Snacks',  45, '🍪', NULL, 4),
  ('Wai Wai snack single',    'Snacks',  40, '🍜', NULL, 5);

-- ============================================================
-- PRODUCTS — Meal Kits (5)
-- ============================================================
INSERT INTO products (name, category, price, icon, badge, sort_order, description, ingredients) VALUES
  ('Dal Bhat Kit', 'Meal Kit', 550, '🍛', 'Best Seller', 1,
   'Everything you need for a classic Nepali dal bhat meal',
   ARRAY['Rice 500g','Masoor daal 200g','Onion','Tomato','Garlic + ginger','Turmeric sachet','Cumin + chilli sachet','Mustard oil 100ml','Local achaar','Recipe card EN/NP']),

  ('Anda Roti Breakfast Kit', 'Meal Kit', 400, '🍳', NULL, 2,
   'A hearty Nepali breakfast for two',
   ARRAY['Eggs ×4','Bread loaf','Butter 50g','Tea bags ×4','Milk 250ml','Sugar sachet','Onion + tomato']),

  ('Chowmein Kit', 'Meal Kit', 400, '🍜', NULL, 3,
   'Street-style chowmein made easy',
   ARRAY['Noodles ×2','Soy sauce','Cabbage + carrot','Eggs ×2','Garlic','Sunflower oil','Chilli sauce']),

  ('Trekker Energy Kit', 'Meal Kit', 320, '🥾', 'Trekkers', 4,
   'Quick energy for your trek or hike',
   ARRAY['Sattu 100g','Wai Wai ×2','Banana ×2','Biscuit pack','ORS sachets ×2','Water bottle 1L','Achaar sachet']),

  ('3-Day Cooking Starter Kit', 'Meal Kit', 1200, '📦', 'Best Value', 5,
   'Everything to cook for 3 days — complete pantry starter',
   ARRAY['Rice 1kg','Daal 500g','Onion + tomato + potato','Eggs ×6','Oil 200ml','Full spice kit','Tea + milk','Achaar jar','Salt + sugar']);
