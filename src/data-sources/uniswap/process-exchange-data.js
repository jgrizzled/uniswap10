// process and add new exchangeDayData to db

import {
  readAllTokens,
  createTokens,
  readTokenByExchangeAddress
} from '../../db-service/tokens-service.js';
import {
  readAllTimestamps,
  createTimestamps
} from '../../db-service/timestamps-service.js';
import {
  readAllDayDatas,
  createDayDatas
} from '../../db-service/exchange-data-service.js';
import { fetchExchangeTokens } from './uniswap-subgraph.js';

const processExchangeData = async exchangeData => {
  let formattedData = formatExchangeData(exchangeData);

  const uniqueExchangeAddrs = [
    ...new Set(formattedData.map(e => e.exchangeAddress))
  ];

  // fetch token info for exchanges
  const tokens = await fetchExchangeTokens(uniqueExchangeAddrs);

  // get existing db tokens
  const existingTokens = await readAllTokens();

  // add new tokens to db
  const newTokens = tokens.filter(
    t => !existingTokens.some(et => et.address === t.address)
  );
  await createTokens(newTokens);

  // get unique sorted timestamps
  const timestamps = [...new Set(formattedData.map(e => e.timestamp))].sort(
    (a, b) => a - b
  );
  // get existing timestamps
  const existingTimestamps = (await readAllTimestamps()).map(t => t.timestamp);
  const newTimestamps = timestamps.filter(
    t => existingTimestamps.indexOf(t) === -1
  );

  // add new timestamps to db
  await createTimestamps(newTimestamps);

  // get existing day data
  const existingDayDatas = await readAllDayDatas();
  const newDayDatas = formattedData.filter(
    d =>
      !existingDayDatas.some(
        ed => ed.timestamp === d.timestamp && ed.tokenID === d.tokenID
      )
  );

  // find tokenIDs
  for (const d of newDayDatas) {
    const token = await readTokenByExchangeAddress(d.exchangeAddress);
    d.tokenID = token.id;
  }

  // add new day data to db
  await createDayDatas(newDayDatas);
};

// format raw exchange data
const formatExchangeData = exchangeData => {
  return (
    exchangeData
      // check data types
      .map(e => ({
        timestamp: Number(e.timestamp),
        exchangeAddress: e.exchangeAddress,
        ethBal: Number(e.ethBal),
        tokenBal: Number(e.tokenBal),
        ethRate: Number(e.ethRate),
        ethVol: Number(e.ethVol)
      }))
      // filter bad data
      .filter(
        e =>
          !isNaN(e.timestamp) &&
          e.timestamp > 1514790000 && // 01-01-2018
          e.exchangeAddress.length > 0 &&
          !isNaN(e.ethBal) &&
          e.ethBal > 0 &&
          !isNaN(e.tokenBal) &&
          e.tokenBal > 0 &&
          !isNaN(e.ethRate) &&
          e.ethRate > 0 &&
          !isNaN(e.ethVol) &&
          e.ethVol >= 0
      )
      // transform data for app
      .map(e => ({
        timestamp: e.timestamp,
        exchangeAddress: e.exchangeAddress,
        liquidity: e.ethBal + e.tokenBal / e.ethRate,
        volume: e.ethVol,
        ethPrice: 1 / e.ethRate
      }))
  );
};

export default processExchangeData;
