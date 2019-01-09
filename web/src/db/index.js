const { Pool, types } = require('pg');
const redis = require('redis');
const { promisify } = require('util');

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
const getCache = promisify(cache.get).bind(cache);

const query = async (
  text,
  params,
  { useCache = false, cacheKey = text + JSON.stringify(params) } = {}
) => {
  let cacheHit = null;
  let result;

  if (useCache) {
    cacheHit = await getCache(cacheKey);
  }

  if (cacheHit !== null) {
    logger.debug(`Redis cachehit`);
    return JSON.parse(cacheHit);
  }

  try {
    result = await pool.query(text, params);
  } catch (err) {
    logger.error(`Postgres: ${JSON.stringify(err)}`);
  }

  if (useCache) {
    cache.set(cacheKey, JSON.stringify(result.rows));
  }

  return result.rows;
};

cache.on('error', err => {
  logger.error(`Redis: ${JSON.stringify(err)}`);
});

module.exports = {
  query,
  pool
};
