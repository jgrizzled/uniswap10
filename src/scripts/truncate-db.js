const { truncateDayDatas } = require('../db-service/exchange-data-service');
const { truncateETH_USDprices } = require('../db-service/ethusd-service');
const { truncateTokens } = require('../db-service/tokens-service');
const { truncateTimestamps } = require('../db-service/timestamps-service');

const truncateDB = async () => {
  console.log('Truncating db');
  await truncateDayDatas();
  await truncateETH_USDprices();
  await truncateTokens();
  await truncateTimestamps();
  process.exit();
};

truncateDB().catch(e => {
  console.error(e);
  process.exit();
});
