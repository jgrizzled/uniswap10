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
const minVol = 100; // ETH

const generateCSV = async () => {
  console.log('Computing index');
  const dbArrays = await prepareDBarrays();
  const [timestamps, tokenIDs, indexReturns, weightsByToken] = calcIndex(
    ...dbArrays,
    period,
    top,
    minVol
  );
  console.log(`Computed indexReturns of length ${indexReturns.length}`);

  // format dates
  const dateStrings = timestamps.map(t => moment.unix(t).format('MM/DD/YYYY'));

  // build token symbol string array
  const tokenSymbols = [];
  for (const id of tokenIDs) {
    const token = await readTokenByID(id);
    tokenSymbols.push(token.symbol);
  }

  // calc ETH/USD returns
  let ETH_USDreturns = calcReturns(
    (await readAllETH_USDprices()).map(p => p.price)
  );

  // calc index returns in USD
  const diff = ETH_USDreturns.length - indexReturns.length;
  ETH_USDreturns = ETH_USDreturns.slice(diff);
  const indexUSDReturns = indexReturns.map((r, i) => r * ETH_USDreturns[i]);

  // calc total returns

  const indexTotalReturns = calcTotalReturns(indexReturns);
  const indexUSDTotalReturns = calcTotalReturns(indexUSDReturns);

  const csvIndex = transpose([
    dateStrings,
    indexTotalReturns,
    indexUSDTotalReturns,
    ...weightsByToken
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
