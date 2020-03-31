// Express web server

import express from 'express'; // HTTP server
import morgan from 'morgan'; // HTTP logging
import helmet from 'helmet'; // secure HTTP headers

import env from '../config/env';
import logger from '../logger.js';
import indexAPI from './index-api.js';

// add async middleware handlers
const webService = express();

// global middleware
const morganSetting = env.NODE_ENV === 'production' ? 'tiny' : 'common';
webService.use(morgan(morganSetting));

webService.use(helmet());

webService.use('/api', indexAPI);

// global error handler
webService.use(function errorHandler(error, req, res, next) {
  logger.error(error);
  let response;
  if (env.NODE_ENV === 'production') response = { error: 'server error' };
  else response = { message: error.message, error };
  res.status(500).json(response);
});

export default webService;
