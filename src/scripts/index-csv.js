// generate index to csv file

'use strict';
import csv from 'csv-writer';
const createCsvWriter = csv.createArrayCsvWriter;
import { transpose } from 'portfolio-tools/src/math/matrix.js';

import calcIndex from '../index/calc-index.js';

const options = {
  top: 10,
  period: 365,
  liquidityWeight: 0.5,
  volumeWeight: 0.5,
  rebalancePeriod: 30,
  weightDivisor: 100
};

const generateCSV = async () => {
  console.log('Computing index');
  const results = await calcIndex(options);
  console.log(`Computed index returns of length ${results.indexETH.length}`);

  // build token symbol string array
  const tokenSymbols = [];
  for (const t of results.tokens) {
    tokenSymbols.push(t.symbol);
  }

  const csvIndex = transpose([
    results.dates,
    results.indexETH,
    results.indexUSD,
    ...results.weightsByAsset
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
