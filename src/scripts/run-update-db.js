import updateDB from '../db-service/update-db.js';

const run = async timestamp => {
  await updateDB(timestamp);
  process.exit(0);
};

run(process.argv[2]).catch(e => {
  console.error(e);
  process.exit(1);
});
