import updateDB from '../db-service/update-db.js';
import { readAllTimestamps } from '../db-service/timestamps-service.js';

const run = async timestamp => {
  if (!timestamp) {
    timestamp = (await readAllTimestamps())
      .map(t => t.timestamp)
      .sort((a, b) => b - a)[0];
    if (isNaN(timestamp)) timestamp = 0;
  }
  await updateDB(timestamp);
  process.exit(0);
};

run(process.argv[2]).catch(e => {
  console.error(e);
  process.exit(1);
});
