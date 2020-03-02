// liquidity/volume weighted

const roundedWeights = require('../math/rounded-weights');

const calcWeights = (dateIndex, pricesByAsset, context) => {
  /*
  if (
    (dateIndex + 1) % context.rebalancePeriod === 0 &&
    dateIndex + 1 >= context.period
  )
    debugger;
  */

  // initialize weights
  let weightByAsset = Array(pricesByAsset.length).fill(0);

  // no weights until avg period
  if (dateIndex + 1 < context.period) return weightByAsset;

  // calc avgs
  const liqAvgByAsset = context.liquiditiesByAsset.map(
    liqs =>
      liqs
        .slice(dateIndex - context.period + 1, dateIndex + 1)
        .reduce((sum, liq) => sum + liq, 0) / liqs.length
  );
  const volAvgByAsset = context.volumesByAsset.map(
    vols =>
      vols
        .slice(dateIndex - context.period + 1, dateIndex + 1)
        .reduce((sum, vol) => sum + vol, 0) / vols.length
  );

  // attach values to assets
  const assets = pricesByAsset.map((_, i) => ({
    value:
      liqAvgByAsset[i] * context.liquidityWeight +
      volAvgByAsset[i] * context.volumeWeight,
    assetIndex: i
  }));

  // get top assets
  assets.sort((a, b) => b.value - a.value);
  const topAssets = assets.slice(0, context.top);

  // calc weight divisor
  const totalValue = topAssets.reduce((sum, a) => sum + a.value, 0);

  // calc weights
  topAssets.forEach(a => {
    weightByAsset[a.assetIndex] = a.value / totalValue;
  });

  // round weights
  weightByAsset = roundedWeights(weightByAsset, context.weightDivisor);

  return weightByAsset;
};

const checkRebalance = (
  currentWeights,
  newWeights,
  dateIndex,
  lastRebalanceIndex,
  context
) => {
  if (
    (lastRebalanceIndex !== null &&
      dateIndex - lastRebalanceIndex >= context.rebalancePeriod &&
      dateIndex + 1 >= context.period) ||
    (lastRebalanceIndex === null && dateIndex + 1 >= context.period)
  )
    return true;
  return false;
};

// strategy defaults
const context = {
  top: 10,
  period: 30,
  liquidityWeight: 0.5,
  volumeWeight: 0.5,
  liquiditiesByAsset: [],
  volumesByAsset: [],
  weightDivisor: 100,
  rebalancePeriod: 7
};

module.exports = { calcWeights, checkRebalance, context };
