// process and add new ETH/USD data to db

import {
  readAllETH_USDprices,
  createETH_USDprices
} from '../../db-service/ethusd-service.js';
import { readAllTimestamps } from '../../db-service/timestamps-service.js';

const processETH_USDdata = async data => {
  // make sure data is sorted by timestamp asc
  data.sort((a, b) => a.timestamp - b.timestamp);

  const timestamps = (await readAllTimestamps()).map(t => t.timestamp);

  // match ETHUSD prices with db timestamps
  const matchedPrices = data.map(d => {
    const earlierTimes = timestamps.filter(t => t <= d.timestamp);
    const dist = a => d.timestamp - a;
    earlierTimes.sort((a, b) => dist(a) - dist(b));
    if (d.timestamp - earlierTimes[0] < 86400) {
      return { timestamp: earlierTimes[0], price: d.price };
    }
    return { timestamp: null, price: null };
  });

  const filteredPrices = matchedPrices.filter(
    p =>
      p.timestamp !== null &&
      !isNaN(p.price) &&
      p.price > 0 &&
      isFinite(p.price)
  );

  const existingPrices = await readAllETH_USDprices();
  const newPrices = filteredPrices.filter(
    p => !existingPrices.some(ep => ep.timestamp == p.timestamp)
  );

  await createETH_USDprices(newPrices);
};

export default processETH_USDdata;
