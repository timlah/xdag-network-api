const logger = require('./logger');
const findStatistic = require('./findStatistic');
const findSoftwareVersion = require('./findSoftwareVersion');
const network = require('./network');
const getPoolResponse = require('./getPoolResponse');
const validState = require('./validState');
const validatePayment = require('./validatePayment');
const {
  getPoolStatistics,
  getStatisticGenerator,
  getSupply,
  getHashrate,
  getState
} = require('./getStatistic');

module.exports = {
  findStatistic,
  findSoftwareVersion,
  network,
  logger,
  validState,
  getPoolResponse,
  getState,
  getSupply,
  getHashrate,
  getStatisticGenerator,
  getPoolStatistics,
  validatePayment
};
