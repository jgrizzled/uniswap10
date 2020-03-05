// Express web server

import dotenv from 'dotenv';
dotenv.config();
import express from 'express'; // HTTP server
import morgan from 'morgan'; // HTTP logging
import helmet from 'helmet'; // secure HTTP headers
import cors from 'cors';

import logger from '../logger.js';
import indexAPI from './index-api.js';

// add async middleware handlers
const webService = express();

// global middleware
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
webService.use(morgan(morganSetting));

webService.use(helmet());
webService.use(cors());

webService.use('/api', indexAPI);

// global error handler
webService.use(function errorHandler(error, req, res, next) {
  logger.error(error);
  let response;
  if (NODE_ENV === 'production') response = { error: 'server error' };
  else response = { message: error.message, error };
  res.status(500).json(response);
});

export default webService;
