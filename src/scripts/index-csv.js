// generate index to csv file

'use strict';
import moment from 'moment';
import csv from 'csv-writer';
const createCsvWriter = csv.createArrayCsvWriter;
import { transpose } from 'portfolio-tools/src/math/matrix.js';
import { readTokenByID } from '../db-service/tokens-service.js';
import calcIndex from '../index/calc-index.js';

const options = {
  top: 10,
  period: 90,
  liquidityWeight: 0.5,
  volumeWeight: 0.5,
  rebalancePeriod: 7,
  weightDivisor: 100
};

const generateCSV = async () => {
  console.log('Computing index');
  const results = await calcIndex(options);
  console.log(`Computed index returns of length ${results.indexETH.length}`);

  // format dates
  const dateStrings = results.timestamps.map(t =>
    moment.unix(t).format('MM/DD/YYYY')
  );

  // build token symbol string array
  const tokenSymbols = [];
  for (const id of results.tokenIDs) {
    const token = await readTokenByID(id);
    tokenSymbols.push(token.symbol);
  }

  const csvIndex = transpose([
    dateStrings,
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
