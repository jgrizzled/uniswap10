// eth_usd_prices table
const db = require('./db');

const createETH_USDprices = prices =>
  db.batchInsert(
    'eth_usd_prices',
    prices.map(({ price, timestamp }) => ({
      price,
      timestamp
    }))
  );

const readAllETH_USDprices = async () =>
  (
    await db('eth_usd_prices')
      .select('*')
      .orderBy('timestamp', 'asc')
  ).map(p => ({ timestamp: Number(p.timestamp), price: Number(p.price) }));

const truncateETH_USDprices = () => db.truncate('eth_usd_prices');

module.exports = {
  createETH_USDprices,
  readAllETH_USDprices,
  truncateETH_USDprices
};
