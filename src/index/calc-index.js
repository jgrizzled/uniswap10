// calculate index returns with db data

import { Simulation } from 'portfolio-tools';
import LVWStrategy from './liquidity-volume-weighted-strategy.js';
import prepareDBarrays from './prepare-db-arrays.js';
import { readAllETH_USDprices } from '../db-service/ethusd-service.js';
import {
  calcReturns,
  calcTotalReturns
} from 'portfolio-tools/src/math/returns.js';

export default async function calcIndex(options) {
  // get formatted data from db
  let [
    timestamps,
    tokenIDs,
    pricesByAsset,
    liquiditiesByAsset,
    volumesByAsset
  ] = await prepareDBarrays();

  const context = {
    liquiditiesByAsset,
    volumesByAsset
  };

  const sim = new Simulation(pricesByAsset, LVWStrategy, options, context);

  sim.run();

  if (!sim.results) throw new Error('no simulation results');

  // filter unused tokens
  const filteredTokenIDs = [];
  const filteredWeightsByAsset = [];
  for (let assetIndex = 0; assetIndex < tokenIDs.length; assetIndex++) {
    if (sim.results.weightsByAsset[assetIndex].some(w => w > 0)) {
      filteredTokenIDs.push(tokenIDs[assetIndex]);
      filteredWeightsByAsset.push(sim.results.weightsByAsset[assetIndex]);
    }
  }
  if (filteredTokenIDs.length === 0) throw new Error('no nonzero weights');

  // filter dates with 0 return
  let dateIndex;
  for (dateIndex = 0; dateIndex < timestamps.length; dateIndex++) {
    if (sim.results.returns[dateIndex] > 0) break;
  }
  const returns = sim.results.returns.slice(dateIndex);
  timestamps = timestamps.slice(dateIndex);
  const weightsByAsset = filteredWeightsByAsset.map(w => w.slice(dateIndex));
  if (returns.length === 0 || timestamps.length === 0)
    throw new Error('Empty nonzero returns/timestamps');

  // calc ETH/USD returns
  const ETH_USDprices = (await readAllETH_USDprices()).map(p => p.price);

  let ETH_USDreturns = calcReturns(ETH_USDprices);

  // calc index returns in USD
  const diff = ETH_USDreturns.length - returns.length;
  ETH_USDreturns = ETH_USDreturns.slice(diff);
  const returnsUSD = returns.map(
    (r, i) => (1 + r) * (1 + ETH_USDreturns[i]) - 1
  );

  // calc total returns
  const indexETH = calcTotalReturns(returns);
  const indexUSD = calcTotalReturns(returnsUSD);

  return {
    indexETH,
    indexUSD,
    timestamps,
    tokenIDs: filteredTokenIDs,
    weightsByAsset
  };
}
