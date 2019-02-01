const fetch = require('node-fetch');

const logger = require('./logger');

const getResponse = async url => {
  let response;
  let body;
  let success = false;
  let type;

  try {
    response = await fetch(url, { timeout: 10000 });

    if (!response.ok) {
      throw Error(`${url}: Non 2xx HTTP code`);
    }
  } catch (err) {
    logger.warn(`${err}`);
    // Don't process further on error
    return { body, success, type };
  }

  try {
    body = await response.text();
  } catch (err) {
    logger.error(`${err}`);

    // Don't process further on error
    return { body, success, type };
  }

  // Try parsing body as JSON
  try {
    body = JSON.parse(body);
    type = 'json';

    if (!Object.prototype.hasOwnProperty.call(body, "error")) {
          // json response doesn't include an error key
      success = true;
    }
  } catch (err) {
    type = 'text';
    // response is text
    // let functions that read data from the text handle errors on their own
    success = true;
  }

  return { body, success, type };
};

module.exports = getResponse;
