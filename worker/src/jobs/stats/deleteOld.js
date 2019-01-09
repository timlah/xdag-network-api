const db = require('../../db');
const { logger } = require('../../utils');

const deleteOld = async () => {
  const interval = '31 days';

  try {
    await db.query(
      "DELETE FROM pool_stats ps WHERE ps.datatime < now() - interval '$1';",
      [interval]
    );
    await db.query(
      "DELETE FROM network_stats ns WHERE ns.datatime < now() - interval '$1';",
      [interval]
    );
    logger.info(`Deleted stats older than ${interval}`);
  } catch (err) {
    logger.error(JSON.stringify(err.stack));
  }
};

module.exports = {
  deleteOld
};
