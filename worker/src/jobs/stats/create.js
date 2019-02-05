const db = require('../../db');
const {
  logger,
  network,
  getPoolResponse,
  getPoolStatistics,
  getState
} = require('../../utils');

// Query database for pools and their data urls
const getPools = async () =>
  db.query('SELECT id, state_url, stats_url FROM pool');

const createPoolRecord = async (
  { id, state_url: stateUrl, stats_url: statsUrl },
  networkRecord
) => {
  let lastModified;
  let state;
  let hashrate;
  let orphanBlocks;
  let waitSyncBlocks;
  let hosts;

  // Some pools display state and other stats from the same URL in JSON, others use seperate URL's
  if (stateUrl === statsUrl) {
    const response = await getPoolResponse(stateUrl);
    // eslint-disable-next-line prefer-destructuring
    lastModified = response.lastModified;

    // Report stats response to networkRecord
    if (response.success) {
      networkRecord.addResponseSuccess(response);
    } else {
      networkRecord.addResponseFailure();
    }

    state = await getState(response);
    ({
      hashrate,
      orphanBlocks,
      waitSyncBlocks,
      hosts
    } = await getPoolStatistics(response));
  } else {
    const stateResponse = await getPoolResponse(stateUrl);
    const statsResponse = await getPoolResponse(statsUrl);

    // eslint-disable-next-line prefer-destructuring
    lastModified = stateResponse.lastModified;

    // Report stats response to networkRecord
    if (statsResponse.success) {
      networkRecord.addResponseSuccess(statsResponse);
    } else {
      networkRecord.addResponseFailure();
    }

    state = await getState(stateResponse);
    ({
      hashrate,
      orphanBlocks,
      waitSyncBlocks,
      hosts
    } = await getPoolStatistics(statsResponse));
  }

  // Filter out invalid hashrate reports (higher than the current reported network hashrate)
  // Can happen when pools are restarting
  const networkHashrate = await networkRecord.getReportedHashrate();
  if (hashrate > networkHashrate) {
    hashrate = null;
  }

  const statement = `
    INSERT INTO pool_stats(pool_id, datatime, pool_state_id, hashrate, orphan_blocks, wait_sync_blocks, hosts) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `;

  const insertData = await db.query(statement, [
    id,
    lastModified || new Date().toISOString(),
    state.id,
    hashrate,
    orphanBlocks,
    waitSyncBlocks,
    hosts
  ]);

  logger.debug(`new pool stats record: ${JSON.stringify(insertData)}`);
  db.cache.del('pool_stats_20_MIN');
};

const create = async () => {
  const pools = await getPools();
  // Argument must be the same as how many requests for stats are going to be made
  const networkRecord = network.initNewRecord(pools.length);

  await Promise.all(pools.map(pool => createPoolRecord(pool, networkRecord)));

  await networkRecord.create();
};

module.exports = {
  create
};
