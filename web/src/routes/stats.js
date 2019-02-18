const Router = require('express-promise-router');

const db = require('../db');
const { channel, ApiError, liveEvents } = require('../utils');

const router = new Router();

// Structure
/*
  {
    pools: [
      {
        id: pool id,
        stats: [
          [unix timestamp, value, ...], ...
        ]
      },
      ...
    ],
    network: {
      [unix timestamp, value, ...], ...
    }
  }
*/
const poolStatementGenerator = (datepart, interval) => `
  select jsonb_agg(pools_object) pools
  from (
      select
          jsonb_build_object(
              'id', id,
              'stats', jsonb_agg(ps_stats)
          ) pools_object
      from (
          select
              p.id,
              jsonb_build_array(
                  extract(epoch from DATE_TRUNC('${datepart}', ps.created_at)),
                  AVG(ps.hashrate)::numeric(16,2),
                  (SELECT type FROM pool_state WHERE id = AVG(pstate.id)::int),
                  AVG(ps.orphan_blocks)::bigint,
                  AVG(ps.wait_sync_blocks)::bigint,
                  AVG(ps.hosts)::int
              ) ps_stats
          from pool p
          join pool_stats ps on ps.pool_id = p.id
          join pool_state pstate on pstate.id = ps.pool_state_id
          WHERE ps.created_at > current_timestamp - interval '${interval}'
          GROUP BY p.id, DATE_TRUNC('${datepart}', ps.created_at)
          ORDER BY p.id ASC, DATE_TRUNC('${datepart}', ps.created_at) ASC
      ) ps
      group by id
  ) ps
`;

const networkStatementGenerator = (datepart, interval) => `
  select jsonb_agg(ns_stats) network
  from (
      select
          jsonb_build_array(
              extract(epoch from DATE_TRUNC('${datepart}', ns.created_at)),
              AVG(ns.hashrate)::numeric(16,2),
              AVG(ns.supply)::bigint,
              AVG(ns.blocks)::bigint,
              AVG(ns.main_blocks)::bigint,
              AVG(ns.hosts)::int,
              AVG(ns.chain_difficulty)::text
          ) ns_stats
      from network_stats ns
      WHERE ns.created_at > current_timestamp - interval '${interval}'
      GROUP BY DATE_TRUNC('${datepart}', ns.created_at)
      ORDER BY DATE_TRUNC('${datepart}', ns.created_at) ASC
  ) ns
`;

const getStats = async ({
  datepart,
  interval,
  networkCacheKey,
  poolCacheKey
}) => {
  const [pools, network] = await Promise.all([
    db.query(poolStatementGenerator(datepart, interval), null, {
      useCache: true,
      cacheKey: poolCacheKey
    }),
    db.query(networkStatementGenerator(datepart, interval), null, {
      useCache: true,
      cacheKey: networkCacheKey
    })
  ]);

  return {
    pools: pools[0].pools,
    network: network[0].network
  };
};

// eslint-disable-next-line consistent-return
router.get('/', async (req, res, next) => {
  try {
    const result = await getStats({
      datepart: 'minute',
      interval: '20 mins',
      networkCacheKey: 'network_stats_20_MIN',
      poolCacheKey: 'pool_stats_20_MIN'
    });

    res.json({ status: 'ok', result });
  } catch (err) {
    return next(new ApiError({ userMessage: 'Database query failed' }, err));
  }
});

// eslint-disable-next-line consistent-return
router.get('/day', async (req, res, next) => {
  try {
    const result = await getStats({
      datepart: 'hour',
      interval: '1 day',
      networkCacheKey: 'network_stats_DAY',
      poolCacheKey: 'pool_stats_DAY'
    });

    res.json({ status: 'ok', result });
  } catch (err) {
    return next(new ApiError({ userMessage: 'Database query failed' }, err));
  }
});

// eslint-disable-next-line consistent-return
router.get('/month', async (req, res, next) => {
  try {
    const result = await getStats({
      datepart: 'day',
      interval: '31 days',
      networkCacheKey: 'network_stats_MONTH',
      poolCacheKey: 'pool_stats_MONTH'
    });

    res.json({ status: 'ok', result });
  } catch (err) {
    return next(new ApiError({ userMessage: 'Database query failed' }, err));
  }
});

router.get('/live', async (req, res) => {
  liveEvents.connect(req, res, channel.statsData);
});

module.exports = router;
