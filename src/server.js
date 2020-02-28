// App server
require('dotenv').config();

const webService = require('./web-service/web-service');
const startDBupdater = require('./db-service/update-scheduler');
const logger = require('./logger');

webService.listen(process.env.PORT || 8000, () => {
  logger.info('Web server is listening on port ' + process.env.PORT);
});

startDBupdater();
logger.info('DB updater started');
