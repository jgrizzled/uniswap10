import updateDB from '../db-service/update-db.js';

updateDB().catch(e => {
  console.error(e);
  process.exit(1);
});
