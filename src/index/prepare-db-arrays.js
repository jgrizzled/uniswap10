// pull data from db and structure for timeseries analysis

const { readAllTimestamps } = require('../db/timestamps-service');
const { readAllTokens } = require('../db/tokens-service');
const { readDayDataByTimestamp } = require('../db/exchange-data-service');
const { newMatrix, transpose } = require('../math/matrix');
const { calcReturns } = require('../math/returns');

const prepareDBarrays = async () => {
  // build timestamps array
  const timestamps = (await readAllTimestamps()).map(t => t.timestamp);
  // get tokenIDs
  const tokenIDs = (await readAllTokens()).map(t => t.id);

  // initialize arrays
  const liquiditiesByDate = newMatrix(timestamps.length, tokenIDs.length),
    volumesByDate = newMatrix(timestamps.length, tokenIDs.length),
    pricesByDate = newMatrix(timestamps.length, tokenIDs.length);

  // for each token, select data by timestamp
  for (let dateIndex = 0; dateIndex < timestamps.length; dateIndex++) {
    const tokenData = await readDayDataByTimestamp(timestamps[dateIndex]);

    for (const token of tokenData) {
      const tokenIndex = tokenIDs.indexOf(token.tokenID);
      if (tokenIndex === -1) throw new Error('unknown token');

      liquiditiesByDate[dateIndex][tokenIndex] = token.liquidity;
      volumesByDate[dateIndex][tokenIndex] = token.volume;
      pricesByDate[dateIndex][tokenIndex] = token.ethPrice;
    }
  }

  // calc returns
  const returnsByDate = transpose(
    transpose(pricesByDate).map(tokenPrices => calcReturns(tokenPrices))
  );

  // remove first day due to zero return
  return [
    timestamps.slice(1),
    tokenIDs,
    liquiditiesByDate.slice(1),
    returnsByDate,
    volumesByDate.slice(1)
  ];
};

module.exports = prepareDBarrays;
