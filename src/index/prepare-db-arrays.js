// pull data from db and structure for timeseries analysis

import { newMatrix } from 'portfolio-tools/src/math/matrix.js';
import { readAllTimestamps } from '../db-service/timestamps-service.js';
import { readAllTokens } from '../db-service/tokens-service.js';
import { readDayDataByTimestamp } from '../db-service/exchange-data-service.js';
import { calcReturns } from 'portfolio-tools/src/math/returns.js';

const prepareDBarrays = async () => {
  // build timestamps array
  const timestamps = (await readAllTimestamps()).map((t) => t.timestamp);

  // get tokenIDs
  const tokenIDs = (await readAllTokens()).map((t) => t.id);

  // initialize arrays
  const liquiditiesByAsset = newMatrix(tokenIDs.length, timestamps.length),
    volumesByAsset = newMatrix(tokenIDs.length, timestamps.length),
    pricesByAsset = newMatrix(tokenIDs.length, timestamps.length);

  // iterate through dates in db
  for (let dateIndex = 0; dateIndex < timestamps.length; dateIndex++) {
    const tokenData = await readDayDataByTimestamp(timestamps[dateIndex]);

    for (const token of tokenData) {
      const tokenIndex = tokenIDs.indexOf(token.tokenID);
      if (tokenIndex === -1) throw new Error('unknown token');

      liquiditiesByAsset[tokenIndex][dateIndex] = token.liquidity;
      volumesByAsset[tokenIndex][dateIndex] = token.volume;
      pricesByAsset[tokenIndex][dateIndex] = token.ethPrice;
    }
  }

  const returnsByAsset = pricesByAsset.map((prices) => calcReturns(prices));

  return [
    timestamps.slice(1),
    tokenIDs,
    returnsByAsset,
    liquiditiesByAsset.map((liqs) => liqs.slice(1)),
    volumesByAsset.map((vols) => vols.slice(1)),
  ];
};

export default prepareDBarrays;
