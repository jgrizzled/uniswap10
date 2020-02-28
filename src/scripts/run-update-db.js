const updateDB = require('../db-service/update-db');

updateDB().catch(e => {
  console.error(e);
  process.exit(1);
});
