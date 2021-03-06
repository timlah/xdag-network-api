const bigInt = require('big-integer');

const db = require('../db');
const logger = require('./logger');
const {
  getSupply,
  getHashrate,
  getBlocks,
  getMainBlocks,
  getHosts,
  getChainDifficulty
} = require('./getStatistic');

// Fetch stats from several pools/explorers
// create a new network record based on all their responses
const initNewRecord = totalResponses => {
  let resolvegetPoolResponses;
  const successResponses = [];
  let responseCount = 0;

  const getPoolResponses = new Promise(resolve => {
    resolvegetPoolResponses = resolve;
  });

  const checkResolve = async () => {
    logger.debug(
      `finished network responses: ${responseCount}, target: ${totalResponses}`
    );
    if (responseCount >= totalResponses) {
      // All stats have been fetched and their responses checked
      logger.debug(`Resolve network responses`);
      resolvegetPoolResponses(successResponses);
    }
  };

  const addResponseSuccess = response => {
    responseCount += 1;
    successResponses.push(response);
    checkResolve();
  };

  const addResponseFailure = () => {
    responseCount += 1;
    checkResolve();
  };

  const sortValues = (responses, getFn, sortFn) =>
    responses
      .map(response => getFn(response, 1))
      .filter(value => value !== null)
      .sort(sortFn);

  const compareNum = (a, b) => a - b;
  const compareBigInt = (a, b) => bigInt(a, 16).compare(bigInt(b, 16));

  const pickValue = (responses, getFn, sortFn) => {
    const sortedValues = sortValues(responses, getFn, sortFn);

    // Use the middle values from sorted lists to reduce the chance of inaccurate data/bad actors
    return sortedValues[Math.floor(sortedValues.length / 2)];
  };

  const getReportedHashrate = async () => {
    const responses = await getPoolResponses;
    return pickValue(responses, getHashrate, compareNum);
  };

  const create = async () => {
    const responses = await getPoolResponses;

    const supply = pickValue(responses, getSupply, compareNum);
    const hashrate = pickValue(responses, getHashrate, compareNum);
    const blocks = pickValue(responses, getBlocks, compareNum);
    const mainBlocks = pickValue(responses, getMainBlocks, compareNum);
    const hosts = pickValue(responses, getHosts, compareNum);
    let chainDifficulty = pickValue(
      responses,
      getChainDifficulty,
      compareBigInt
    );

    // bigInt(null, 16).toString() generates the string 0.000...
    // keep it null so its inserted as null to the database
    if (chainDifficulty !== null) {
      chainDifficulty = bigInt(chainDifficulty, 16).toString();
    }

    const statement = `
      INSERT INTO network_stats(supply, hashrate, blocks, main_blocks, hosts, chain_difficulty) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;

    const insertData = await db.query(statement, [
      supply,
      hashrate,
      blocks,
      mainBlocks,
      hosts,
      chainDifficulty
    ]);

    db.cache.del('network_stats_20_MIN');
    logger.debug(
      `Create new network stats record: ${JSON.stringify(insertData)}`
    );
  };

  return {
    create,
    addResponseFailure,
    addResponseSuccess,
    getReportedHashrate
  };
};

module.exports = {
  initNewRecord
};
