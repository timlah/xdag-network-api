const db = require('../db');

// Query database for valid states
const validStatesPromise = new Promise(resolve => {
  db.query('SELECT id, type, server_response FROM pool_state').then(result => {
    resolve(result);
  });
});

const getFromType = async type => {
  const validStates = await validStatesPromise;
  return validStates.find(state => state.type === type);
};

const getFromResponse = async input => {
  const validStates = await validStatesPromise;

  return (
    validStates.find(validState =>
      input.includes(validState.server_response)
    ) || getFromType('UNKNOWN')
  );
};

module.exports = {
  getFromResponse,
  getFromType
};
