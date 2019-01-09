const express = require('express');
// const Knex = require('knex');
// const { Model } = require('objection');

const { logger } = require('./utils');
const mountRoutes = require('./routes');

const isProduction = process.env.NODE_ENV === 'production';

// Initialize knex.
/* const knex = Knex({
    client: 'postgresql',
    connection: {
      database: 'example'
    },
    pool: {
      min: 2,
      max: 10
    }
  });

// Bind all Models to a knex instance.
Model.knex(knex); */

const app = express();

mountRoutes(app);

// catch 404 and forward to error handler
app.use('*', (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
if (!isProduction) {
  // express requires the "next" parameter to recognize used function as an error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    logger.error(err.stack);

    res.status(err.status || 500);
    res.json({
      status: 'error',
      message: err.message,
      error: err
    });
  });
}

// production error handler
// express requires the "next" parameter to recognize used function as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack);

  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.userMessage || err.message
  });
});

module.exports = app;
