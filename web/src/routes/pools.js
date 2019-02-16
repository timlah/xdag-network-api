/* eslint-disable camelcase */
const Router = require('express-promise-router');

const db = require('../db');
const { ApiError } = require('../utils');

const router = new Router();

// eslint-disable-next-line consistent-return
router.get('/', async (req, res, next) => {
  const poolsStatement = `
    SELECT
      p.id,
      p.location,
      p.location_coordinate,
      p.name,
      p.website,
      p.mining_address,
      p.payment_pool,
      p.payment_finder,
      p.payment_contributor,
      p.payment_community,
      p.version
    FROM pool p
  `;

  try {
    const result = await db.query(poolsStatement, null, {
      useCache: true,
      cacheKey: 'pool_list'
    });

    if (!result.length) {
      throw new Error("0 length response from pools query");
    }

    const parsedResult = result.map(
      ({
        payment_pool,
        payment_finder,
        payment_contributor,
        payment_community,
        ...pool
      }) => ({
        // node pg serves numeric values as strings by default
        payment_pool: parseFloat(payment_pool),
        payment_finder: parseFloat(payment_finder),
        payment_contributor: parseFloat(payment_contributor),
        payment_community: parseFloat(payment_community),
        ...pool
      })
    );
    res.json({
      status: 'ok',
      result: parsedResult
    });
  } catch (err) {
    return next(new ApiError({ userMessage: 'Database query failed' }, err));
  }
});

module.exports = router;
