// generate index to csv file

'use strict';
const moment = require('moment');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const { readTokenByID } = require('../db-service/tokens-service');
const { readAllETH_USDprices } = require('../db-service/ethusd-service');
const prepareDBarrays = require('../index/prepare-db-arrays');
const calcIndex = require('../index/calc-index');
const { calcReturns, calcTotalReturns } = require('../math/returns');
const { transpose } = require('../math/matrix');

// settings
const top = 10; // max tokens in holdings
const period = 90; // days
const liqWeight = 0.5;
const volWeight = 0.5;

const generateCSV = async () => {
  console.log('Computing index');
  let [
    timestamps,
    tokenIDs,
    pricesByAsset,
    liquiditiesByAsset,
    volumesByAsset
  ] = await prepareDBarrays();
  let [indexReturns, weightsByAsset] = calcIndex(
    pricesByAsset,
    liquiditiesByAsset,
    volumesByAsset,
    period,
    top,
    liqWeight,
    volWeight
  );
  console.log(`Computed indexReturns of length ${indexReturns.length}`);

  // filter unused tokens
  let filteredTokenIDs = [];
  let filteredWeightsByAsset = [];
  for (let assetIndex = 0; assetIndex < tokenIDs.length; assetIndex++) {
    if (weightsByAsset[assetIndex].some(w => w > 0)) {
      filteredTokenIDs.push(tokenIDs[assetIndex]);
      filteredWeightsByAsset.push(weightsByAsset[assetIndex]);
    }
  }
  if (filteredTokenIDs.length === 0) throw new Error('no nonzero weights');

  // filter dates with 0 return
  let dateIndex;
  for (dateIndex = 0; dateIndex < timestamps.length; dateIndex++) {
    if (indexReturns[dateIndex] > 0) break;
  }
  indexReturns = indexReturns.slice(dateIndex);
  timestamps = timestamps.slice(dateIndex);
  filteredWeightsByAsset = transpose(
    transpose(filteredWeightsByAsset).slice(dateIndex)
  );
  if (indexReturns.length === 0 || timestamps.length === 0)
    throw new Error('Empty nonzero returns/timestamps');

  // format dates
  const dateStrings = timestamps.map(t => moment.unix(t).format('MM/DD/YYYY'));

  // build token symbol string array
  const tokenSymbols = [];
  for (const id of filteredTokenIDs) {
    const token = await readTokenByID(id);
    tokenSymbols.push(token.symbol);
  }

  // calc ETH/USD returns
  const ETH_USDprices = (await readAllETH_USDprices()).map(p => p.price);

  let ETH_USDreturns = calcReturns(ETH_USDprices);

  // calc index returns in USD
  const diff = ETH_USDreturns.length - indexReturns.length;
  ETH_USDreturns = ETH_USDreturns.slice(diff);
  const indexUSDReturns = indexReturns.map(
    (r, i) => (1 + r) * (1 + ETH_USDreturns[i]) - 1
  );

  // calc total returns

  const indexTotalReturns = calcTotalReturns(indexReturns);
  const indexUSDTotalReturns = calcTotalReturns(indexUSDReturns);

  const csvIndex = transpose([
    dateStrings,
    indexTotalReturns,
    indexUSDTotalReturns,
    ...filteredWeightsByAsset
  ]);

  console.log('Writing results to CSV');

  const csvWriter = createCsvWriter({
    path: 'uniswap-index.csv',
    header: ['dates', 'indexETH', 'indexUSD', ...tokenSymbols]
  });

  await csvWriter.writeRecords(csvIndex);

  process.exit();
};

generateCSV().catch(e => {
  console.error(e);
  process.exit();
});
