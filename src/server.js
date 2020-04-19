// App server
import env from './config/env.js';

import webService from './web-service/web-service.js';
import logger from './logger.js';
import db from './db-service/db.js';

const HTTPserver = webService.listen(env.PORT, () => {
  logger.info('Web server is listening on port ' + env.PORT);
});

const closeServer = async () => {
  console.log('Shutting down');
  try {
    await HTTPserver.close(err => {
      if (err) throw err;
    });
    await db.destroy();
    process.exit(0);
  } catch (e) {
    fail(e);
  }
};

const fail = e => {
  console.error(e);
  process.exit(1);
};

process.on('SIGINT', closeServer);
