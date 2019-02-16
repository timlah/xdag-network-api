const fetch = require('node-fetch');
const logger = require('./logger');

const getPoolResponse = async url => {
  let success = false;
  let response;
  let body;
  let lastModified;
  let type;

  try {
    response = await fetch(url, { timeout: 10000 });

    console.log(response);

    if (!response.ok) {
      throw Error(`${url}: Non 2xx HTTP code`);
    }
  } catch (err) {
    logger.warn(JSON.stringify(err.stack));

    // Don't process further on error
    return { body, success, type: '1' };
  }

  try {
    body = await response.text();
  } catch (err) {
    logger.warn(JSON.stringify(err.stack));

    // Don't process further on error
    return { body, success, type: '2' };
  }

  // Try parsing body as JSON
  try {
    body = JSON.parse(body);
    type = 'json';

    if (Object.prototype.hasOwnProperty.call(body, 'error')) {
      // Don't process further on error
      return { body, success, type: '3' };
    }
  } catch (err) {
    // response is text
    type = 'text';
  }

  try {
    if (type === 'json') {
      lastModified = new Date(body.date).toISOString();
    } else {
      lastModified = new Date(
        response.headers.get('last-modified')
      ).toISOString();
    }
  } catch (err) {
    logger.warn(`Missing last modified date from: ${url}`);
    lastModified = null;
  }

  success = true;
  return { body, success, type, lastModified };
};

module.exports = getPoolResponse;
