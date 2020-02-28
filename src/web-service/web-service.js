// Express web server

require('dotenv').config();
const express = require('express'); // HTTP server
const morgan = require('morgan'); // HTTP logging
const helmet = require('helmet'); // secure HTTP headers

const logger = require('../logger');
const indexAPI = require('./index-api');

// add async middleware handlers
const webService = express();

// global middleware
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
webService.use(morgan(morganSetting));

webService.use(helmet());

webService.use('/index', indexAPI);

// global error handler
webService.use(function errorHandler(error, req, res, next) {
  logger.error(error);
  let response;
  if (NODE_ENV === 'production') response = { error: 'server error' };
  else response = { message: error.message, error };
  res.status(500).json(response);
});

module.exports = webService;
