const { Pool } = require('pg');
const redis = require('redis');

// require directly from file to avoid an error
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_USER,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});
const cache = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
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
