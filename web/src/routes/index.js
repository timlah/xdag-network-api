const pools = require('./pools');
const stats = require('./stats');

module.exports = app => {
  app.use('/pools', pools);
  app.use('/stats', stats);
};
