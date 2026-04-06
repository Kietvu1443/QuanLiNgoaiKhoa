const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database queries will fail until it is configured.');
}

const pool = new Pool({
  connectionString,
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
