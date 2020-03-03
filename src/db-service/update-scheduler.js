import { readAllTimestamps } from './timestamps-service.js';
import moment from 'moment';

import updateDB from './update-db.js';
import logger from '../logger.js';

const startDBupdater = async () => {
  // get most recent date
  let latestTimestamp = (await readAllTimestamps())
    .map(t => t.timestamp)
    .sort((a, b) => b - a)[0];
  if (isNaN(latestTimestamp)) latestTimestamp = 0;
  let latestDate = moment.unix(latestTimestamp);
  logger.info('Found latest date ' + latestDate.toString());

  // check if its been 24h since most recent date
  const now = moment();
  const sinceLastUpdate = now.diff(latestDate, 'h');
  logger.info(`Its been ${sinceLastUpdate} hrs since last update`);

  // if yes, do fetches, get new most recent date
  if (sinceLastUpdate > 24) {
    logger.info('Stale data, fetching newest');
    await updateDB(latestTimestamp);
    // update most recent date
    latestTimestamp = (await readAllTimestamps())
      .map(t => t.timestamp)
      .sort((a, b) => b - a)[0];
    latestDate = moment.unix(latestTimestamp);
  }

  // schedule cron for most recent date + 24hr
  const nextUpdate = latestDate.add(1, 'd');
  const timeout = nextUpdate.diff(now, 'ms');
  logger.info(
    `Scheduling next update for ${moment
      .duration(timeout, 'ms')
      .as('h')} hrs from now`
  );
  setTimeout(recurringUpdate, timeout);
};

const recurringUpdate = () => {
  logger.info('Running scheduled DB update');
  updateDB();

  const timeout = moment.duration(1, 'd').as('ms');
  logger.info(
    `Scheduling next update for ${moment
      .duration(timeout, 'ms')
      .as('h')} hrs from now`
  );
  setTimeout(recurringUpdate, timeout);
};

export default startDBupdater;
