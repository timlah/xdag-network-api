const fetch = require('node-fetch');
const logger = require('./logger');

const getResponse = async url => {
  let response;
  let body;
  let success;
  let type;

  try {
    response = await fetch(url, { timeout: 10000 });

    if (!response.ok) {
      throw Error(`${url}: Non 2xx HTTP code`);
    }
  } catch (err) {
    logger.warn(JSON.stringify(err.stack));
    success = false;

    // Don't process further on error
    return { body, success, type };
  }

  try {
    body = await response.text();
    success = true;
  } catch (err) {
    logger.warn(JSON.stringify(err.stack));

    // Don't process further on error
    return { body, success, type };
  }

  // Try parsing body as JSON
  try {
    body = JSON.parse(body);
    type = 'json';
  } catch (err) {
    type = 'text';
  }

  return { body, success, type };
};

module.exports = getResponse;
