// index calculation
const indexStrategy = require('./index-strategy');
const backtester = require('./backtester');

const calcIndex = (
  pricesByAsset,
  liquiditiesByAsset,
  volumesByAsset,
  period,
  top,
  liqWeight,
  volWeight
) => {
  if (
    liquiditiesByAsset[0].length !== pricesByAsset[0].length ||
    volumesByAsset[0].length !== pricesByAsset[0].length ||
    period < 2 ||
    top < 1 ||
    liqWeight + volWeight !== 1
  )
    throw new Error('Invalid index strategy params');

  // set strategy context params
  indexStrategy.context.liquiditiesByAsset = liquiditiesByAsset;
  indexStrategy.context.volumesByAsset = volumesByAsset;
  indexStrategy.context.period = period;
  indexStrategy.context.top = top;
  indexStrategy.context.liquidityWeight = liqWeight;
  indexStrategy.context.volumeWeight = volWeight;
  console.log('Running backtest');

  return backtester(
    indexStrategy.calcWeights,
    indexStrategy.checkRebalance,
    pricesByAsset,
    indexStrategy.context
  );
};

module.exports = calcIndex;
