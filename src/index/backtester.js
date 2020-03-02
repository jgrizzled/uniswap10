/*
Params
  calcWeights: function(dateIndex, pricesByAsset, context) returns weightByAsset[]
  checkRebalance: function(currentWeights, newWeights, dateIndex, lastRebalanceIndex, context) returns bool
  pricesByAsset: 2D array of prices by asset ex [ asset1Prices[], asset2Prices[], ... ]
  initialWeights (optional): weightByAsset[]
  context (optional): object that gets passed to calcWeights and checkRebalance with contextual data

Returns
 Array
  [
    returns[],
    weightsByAsset[][]
  ]
*/

const backtester = (
  calcWeights,
  checkRebalance,
  pricesByAsset,
  context = {},
  initialWeights = Array(pricesByAsset.length).fill(0)
) => {
  if (pricesByAsset.some(el => el.length !== pricesByAsset[0].length))
    throw new Error('pricesByAsset not uniform length');
  if (initialWeights.length !== pricesByAsset.length)
    throw new Error('initialWeights invalid length');

  // initialize results
  const returns = [0];
  const weightsByAsset = initialWeights.map(w => [w]);

  let currentWeights = initialWeights;
  let lastRebalanceIndex = null;
  // iterate through dates
  for (let dateIndex = 1; dateIndex < pricesByAsset[0].length; dateIndex++) {
    // calc date's return from prev date
    returns[dateIndex] = currentWeights.reduce((r, w, assetIndex) => {
      const prev = pricesByAsset[assetIndex][dateIndex - 1];
      const curr = pricesByAsset[assetIndex][dateIndex];
      if (prev <= 0 || curr <= 0 || isNaN(prev) || isNaN(curr)) return r;
      return r + w * ((curr - prev) / prev);
    }, 0);

    // calc new weights
    const newWeights = calcWeights(dateIndex, pricesByAsset, context);

    // check if should rebalance
    if (
      checkRebalance(
        currentWeights,
        newWeights,
        dateIndex,
        lastRebalanceIndex,
        context
      )
    ) {
      // check if new weight calculations differ from current
      if (currentWeights.some((cw, i) => cw !== newWeights[i])) {
        console.log('Rebalancing at date index ' + dateIndex);
        currentWeights = newWeights;
        lastRebalanceIndex = dateIndex;
      }
    }

    // record date's weights
    weightsByAsset.forEach(
      (assetWeights, assetIndex) =>
        (assetWeights[dateIndex] = currentWeights[assetIndex])
    );
  }

  return [returns, weightsByAsset];
};

module.exports = backtester;
