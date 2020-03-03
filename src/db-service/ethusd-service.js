// eth_usd_prices table
import db from './db.js';

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

export { createETH_USDprices, readAllETH_USDprices, truncateETH_USDprices };
