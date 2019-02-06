const validState = require('./validState');
const findStatistic = require('./findStatistic');
const isOkLastModified = require('./isOkLastModified');

// Responses from explorers/pools include stats for the themselves and the entire network
// index 0 = self, 1 = network
const getStatisticGenerator = ({ jsonKey, textKey, validate, primitive }) => (
  { success, body, type, lastModified },
  useIndex = 0
) => {
  let value;

  if (!success || !isOkLastModified(lastModified)) {
    return null;
  }

  if (type === 'json') {
    const result = body.stats[jsonKey];

    value = primitive(Array.isArray(result) ? result[useIndex] : result);
  } else {
    value = primitive(findStatistic(body, textKey, useIndex));
  }

  // Return undefined if value is not a valid
  const result = validate(value) ? value : undefined;
  return result;
};

const getHashrate = getStatisticGenerator({
  jsonKey: '4_hr_hashrate_mhs',
  textKey: '(?:(?:4 hr)|(?:hour)) hashrate MHs',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getSupply = getStatisticGenerator({
  jsonKey: 'xdag_supply',
  textKey: 'XDAG supply',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getBlocks = getStatisticGenerator({
  jsonKey: 'blocks',
  textKey: 'blocks',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getMainBlocks = getStatisticGenerator({
  jsonKey: 'main_blocks',
  textKey: 'main blocks',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getHosts = getStatisticGenerator({
  jsonKey: 'hosts',
  textKey: 'hosts',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getOrphanBlocks = getStatisticGenerator({
  jsonKey: 'orphan_blocks',
  textKey: 'orphan blocks',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getWaitSyncBlocks = getStatisticGenerator({
  jsonKey: 'wait_sync_blocks',
  textKey: 'wait sync blocks',
  primitive: Number,
  validate: value => typeof value === 'number' && !Number.isNaN(value)
});

const getChainDifficulty = getStatisticGenerator({
  jsonKey: 'chain_difficulty',
  textKey: 'chain difficulty',
  primitive: String,
  validate: value => /^[0-9a-fA-F]+$/.test(value)
});

const getState = async ({ success, body, type, lastModified }) => {
  if (!success) {
    return validState.getFromType('NO_RESPONSE');
  }

  if (!isOkLastModified(lastModified)) {
    return validState.getFromType('UNKNOWN');
  }

  if (type === 'json') {
    return validState.getFromResponse(body.state);
  }
  return validState.getFromResponse(body);
};

const getPoolStatistics = response => ({
  hashrate: getHashrate(response),
  hosts: getHosts(response),
  orphanBlocks: getOrphanBlocks(response),
  waitSyncBlocks: getWaitSyncBlocks(response)
});

module.exports = {
  getSupply,
  getHashrate,
  getMainBlocks,
  getBlocks,
  getHosts,
  getChainDifficulty,
  getState,
  getPoolStatistics,
  getStatisticGenerator
};
