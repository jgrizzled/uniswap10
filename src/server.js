// App server
import env from './config/env.js';

import webService from './web-service/web-service.js';
import logger from './logger.js';
import updateDB from './db-service/update-db.js';

updateDB().then(() => {
  webService.listen(env.PORT, () => {
    logger.info('Web server is listening on port ' + env.PORT);
  });
});
