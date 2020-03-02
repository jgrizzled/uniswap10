// pull data from db and structure for timeseries analysis

const { readAllTimestamps } = require('../db-service/timestamps-service');
const { readAllTokens } = require('../db-service/tokens-service');
const {
  readDayDataByTimestamp
} = require('../db-service/exchange-data-service');
const { newMatrix } = require('../math/matrix');

const prepareDBarrays = async () => {
  // build timestamps array
  const timestamps = (await readAllTimestamps()).map(t => t.timestamp);

  // get tokenIDs
  const tokenIDs = (await readAllTokens()).map(t => t.id);

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

  return [
    timestamps,
    tokenIDs,
    pricesByAsset,
    liquiditiesByAsset,
    volumesByAsset
  ];
};

module.exports = prepareDBarrays;
