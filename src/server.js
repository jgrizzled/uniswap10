// App server
import dotenv from 'dotenv';
dotenv.config();

import webService from './web-service/web-service.js';
import logger from './logger.js';
import updateDB from './db-service/update-db.js';

updateDB().then(() => {
  const port = process.env.PORT || 8000;
  webService.listen(port, () => {
    logger.info('Web server is listening on port ' + port);
  });
});
