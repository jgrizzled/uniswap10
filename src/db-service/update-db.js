// fetch remote data and process new items

import { fetchExchangeDataAfterDate } from '../data-sources/uniswap/uniswap-subgraph.js';
import fetchTimeseries from '../data-sources/alpha-vantage/fetch-timeseries.js';
import processExchangeData from '../data-sources/uniswap/process-exchange-data.js';
import processETH_USDdata from '../data-sources/alpha-vantage/process-ethusd-data.js';

const updateDB = async lastTimestamp => {
  console.log('Fetching exchangeDayDatas');
  const exchangeDayDatas = await fetchExchangeDataAfterDate(lastTimestamp);
  await processExchangeData(exchangeDayDatas);
  console.log('Fetching ETH/USD timeseries');
  const ETH_USDdata = await fetchTimeseries('ETH', 'USD');
  await processETH_USDdata(ETH_USDdata);
  console.log(`Got ${ETH_USDdata.length} days`);
};

export default updateDB;
