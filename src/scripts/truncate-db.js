import { truncateDayDatas } from '../db-service/exchange-data-service.js';
import { truncateETH_USDprices } from '../db-service/ethusd-service.js';
import { truncateTokens } from '../db-service/tokens-service.js';
import { truncateTimestamps } from '../db-service/timestamps-service.js';

const truncateDB = async () => {
  console.log('Truncating db');
  await truncateDayDatas();
  await truncateETH_USDprices();
  await truncateTokens();
  await truncateTimestamps();
  process.exit(0);
};

truncateDB().catch(e => {
  console.error(e);
  process.exit(1);
});
