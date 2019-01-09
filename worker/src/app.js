const cron = require('node-cron');

const db = require('./db');
const { logger } = require('./utils');
const stats = require('./jobs/stats');
const pools = require('./jobs/pools');

pools.update().catch(err => {
  logger.error(err.stack);
});

// once a minute
cron.schedule('* * * * *', () => {
  stats.create().catch(err => {
    logger.error(err.stack);
  });
});

// once every 15 minutes
cron.schedule('*/15 * * * *', () => {
  pools.update().catch(err => {
    logger.error(err.stack);
  });
});

// Once an hour
cron.schedule('0 * * * *', () => {
  db.cache.del('pool_stats_DAY', 'network_stats_DAY');
});

// Once a day
cron.schedule('0 0 * * *', () => {
  stats.deleteOld().catch(err => {
    logger.error(err.stack);
  });
  db.cache.del('pool_stats_MONTH', 'network_stats_MONTH');
});
