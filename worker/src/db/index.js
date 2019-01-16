const { Pool } = require('pg');
const redis = require('redis');

// require directly from file to avoid an error
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_USER,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
});
const cache = redis.createClient({
  host: process.env.CACHE_HOST,
  port: process.env.CACHE_PORT
});

const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};

cache.on('error', err => {
  logger.error(`Redis: ${JSON.stringify(err)}`);
});

module.exports = {
  query,
  cache
};
