/*  liquidity/volume weighted strategy

    options {
      top: top n tokens in weights
      period: average period
      volumeWeight: weight factor for average volume
      liquidityWeight: weight factor for average liquidity
          * volumeWeight and liquidityWeight must sum to 1
      weightDivisor: round weights to multiples of 1/weightDivisor
      rebalancePeriod: min dates between rebalances }

    context {
      liquiditiesByAsset: []
      weightsByAsset: [] } */

import { Strategy } from 'portfolio-tools';
import pa from 'portfolio-allocation';
const { roundedWeights } = pa;

const calcWeights = (dateIndex, pricesByAsset, options, context) => {
  // initialize weights
  let weightByAsset = Array(pricesByAsset.length).fill(0);

  // no weights until avg period
  if (dateIndex + 1 < options.period) return weightByAsset;

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
      liqAvgByAsset[i] * options.liquidityWeight +
      volAvgByAsset[i] * options.volumeWeight,
    assetIndex: i
  }));

  // get top assets
  assets.sort((a, b) => b.value - a.value);
  const topAssets = assets.slice(0, options.top);

  // calc weight divisor
  const totalValue = topAssets.reduce((sum, a) => sum + a.value, 0);

  // calc weights
  topAssets.forEach(a => {
    weightByAsset[a.assetIndex] = a.value / totalValue;
  });

  // round weights
  weightByAsset = roundedWeights(weightByAsset, options.weightDivisor);

  return weightByAsset;
};

const checkRebalance = (
  currentWeights,
  newWeights,
  dateIndex,
  lastRebalanceIndex,
  options,
  context
) => {
  if (
    (lastRebalanceIndex !== null &&
      dateIndex - lastRebalanceIndex >= options.rebalancePeriod &&
      dateIndex + 1 >= options.period) ||
    (lastRebalanceIndex === null && dateIndex + 1 >= options.period)
  )
    return true;
  return false;
};

const validateOptions = (options, pricesByAsset) => {
  if (
    typeof options.top !== 'number' ||
    options.top < 1 ||
    options.top > pricesByAsset.length
  )
    throw new Error('invalid top ' + options.top);

  if (
    typeof options.period !== 'number' ||
    options.period < 2 ||
    options.period >= pricesByAsset.length
  )
    throw new Error('invalid period ' + options.period);

  if (
    typeof options.liquidityWeight !== 'number' ||
    options.liquidityWeight < 0 ||
    typeof options.volumeWeight !== 'number' ||
    options.volumeWeight < 0 ||
    options.liquidityWeight + options.volumeWeight !== 1
  )
    throw new Error(
      `invalid volume weight ${options.volumeWeight} and/or liquidity weight ${options.liquidityWeight}`
    );

  if (
    typeof options.weightDivisor !== 'number' ||
    options.weightDivisor < 1 ||
    !Number.isInteger(options.weightDivisor)
  )
    if (
      typeof options.rebalancePeriod !== 'number' ||
      options.rebalancePeriod < 1 ||
      !Number.isInteger(options.rebalancePeriod) ||
      options.rebalancePeriod >= pricesByAsset[0].length
    )
      throw new Error('invalid rebalancePeriod ' + options.rebalancePeriod);
};

const validateContext = (context, pricesByAsset) => {
  if (
    context.liquiditiesByAsset.length !== pricesByAsset.length ||
    context.liquiditiesByAsset[0].length !== pricesByAsset[0].length
  )
    throw new Error('invalid liquiditiesByAsset');

  if (
    context.volumesByAsset.length !== pricesByAsset.length ||
    context.volumesByAsset[0].length !== pricesByAsset[0].length
  )
    throw new Error('invalid liquiditiesByAsset');
};

export default new Strategy(
  calcWeights,
  checkRebalance,
  validateOptions,
  validateContext
);
