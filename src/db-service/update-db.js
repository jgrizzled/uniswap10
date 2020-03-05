// fetch remote data and process new items

import { fetchExchangeDataAfterDate } from '../data-sources/uniswap/uniswap-subgraph.js';
import fetchTimeseries from '../data-sources/alpha-vantage/fetch-timeseries.js';
import processExchangeData from '../data-sources/uniswap/process-exchange-data.js';
import processETH_USDdata from '../data-sources/alpha-vantage/process-ethusd-data.js';
import logger from '../logger.js';

const updateDB = async lastTimestamp => {
  logger.info('Fetching exchangeDayDatas');
  const exchangeDayDatas = await fetchExchangeDataAfterDate(lastTimestamp);
  if (exchangeDayDatas.length > 0) await processExchangeData(exchangeDayDatas);
  logger.info('Fetching ETH/USD timeseries');
  const ETH_USDdata = await fetchTimeseries('ETH', 'USD');
  if (ETH_USDdata.length > 0) await processETH_USDdata(ETH_USDdata);
  logger.info(`Got ${ETH_USDdata.length} days`);
};

export default updateDB;
