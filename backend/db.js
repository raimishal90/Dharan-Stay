const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'dharanstays',
  user: process.env.DB_USER || 'dharan',
  password: process.env.DB_PASSWORD || 'changeme',
});

module.exports = pool;
