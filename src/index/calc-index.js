// index calculation

const roundedWeights = require('../math/rounded-weights');
const { transpose } = require('../math/matrix');
const calcSMA = require('../math/sma');

/*
  params (
    dates[],
    tokenIDs[],
    liquiditiesByDate[ day1liquidities[], day2liquidities[], ... ],
    returnsByDate[ day1returns[], day2returns[], ... ],
    volumesByDate[ day1volumes[], day2volumes[], ... ],
    period,
    top,
    minVol
  )

  returns 
    [
      dates[],
      tokenIDs[],
      indexReturns[],
      weightsByToken[ token1weight[], token2weight[], ... ]
    ]
*/
const calcIndex = (
  dates,
  tokenIDs,
  liquiditiesByDate,
  returnsByDate,
  volumesByDate,
  period = 365,
  top = 10,
  minAvgVolume = 0
) => {
  // check invalid params
  if (
    tokenIDs.length !== liquiditiesByDate[0].length ||
    dates.length !== liquiditiesByDate.length ||
    period < 2 ||
    period > dates.length - 1 ||
    top < 0 ||
    top > 1000 ||
    minAvgVolume < 0
  ) {
    throw new Error('Invalid params');
  }

  const liquidityAvgsByDate = transpose(
    transpose(liquiditiesByDate).map(liqs => calcSMA(liqs, period))
  );

  const volumeAvgsByDate = transpose(
    transpose(volumesByDate).map(volumes => calcSMA(volumes, period))
  );

  const indexTokenIDs = [],
    indexReturns = [],
    weightsByToken = [];

  // iterate through dates
  const dateIndexOffset = dates.length - liquidityAvgsByDate.length;
  for (let dateIndex = 0; dateIndex < liquidityAvgsByDate.length; dateIndex++) {
    // attach tokenIDs to values
    let tokens = tokenIDs.map((id, tokenIndex) => ({
      id,
      tokenReturn: returnsByDate[dateIndex + dateIndexOffset][tokenIndex],
      avgLiq: liquidityAvgsByDate[dateIndex][tokenIndex],
      avgVol: volumeAvgsByDate[dateIndex][tokenIndex]
    }));

    // sort by avg liquidity
    tokens.sort((a, b) => b.avgLiq - a.avgLiq);

    // filter by min volume
    const volFilteredTokens = tokens.filter(t => t.avgVol >= minAvgVolume);

    let topTokens = volFilteredTokens.slice(0, top);

    const totalLiquidity = topTokens.reduce((sum, t) => sum + t.avgLiq, 0);

    // set this days weights to zero for all tokens
    weightsByToken.forEach(w => w.push(0));

    if (totalLiquidity === 0) {
      console.log('0 liquidity for date ' + dates[dateIndex + dateIndexOffset]);
      // push results
      indexReturns.push(0);
    } else {
      // calc weights rounded to 0.01
      const unroundedWeights = topTokens.map(t => t.avgLiq / totalLiquidity);
      const weights = roundedWeights(unroundedWeights, 100);
      topTokens.forEach((t, i) => (t.weight = weights[i]));

      // filter out tokens with weights rounded to 0
      topTokens = topTokens.filter(t => t.weight > 0);

      if (topTokens.length === 0) console.warn('Empty topTokens');

      // calc index value with sum of token weight * token return
      const indexReturn = topTokens.reduce(
        (sum, token) => sum + token.weight * token.tokenReturn,
        0
      );

      // push results
      indexReturns.push(indexReturn);

      // initialize this days weights to zero for all tokens
      weightsByToken.forEach(w => w.push(0));

      // add weights of this date's tokens
      topTokens.forEach(t => {
        // find index of current token in new index array
        const newTokenIndex = indexTokenIDs.indexOf(t.id);
        if (newTokenIndex === -1) {
          // push new found tokenID into new tokenID array
          indexTokenIDs.push(t.id);
          // initialize its weights array to current length
          weightsByToken.push(Array(dateIndex).fill(0));
          // add new weight
          weightsByToken[weightsByToken.length - 1][dateIndex] = t.weight;
        } else weightsByToken[newTokenIndex][dateIndex] = t.weight;
      });
    }
  }

  // get latest dates
  const indexDates = dates.slice(dates.length - indexReturns.length);

  return [indexDates, indexTokenIDs, indexReturns, weightsByToken];
};

module.exports = calcIndex;
