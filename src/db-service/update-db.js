// fetch remote data and process new items

const {
  fetchExchangeDataAfterDate
} = require('../data-sources/uniswap/uniswap-subgraph');
const fetchTimeseries = require('../data-sources/alpha-vantage/fetch-timeseries');
const processExchangeData = require('../data-sources/uniswap/process-exchange-data');
const processETH_USDdata = require('../data-sources/alpha-vantage/process-ethusd-data');

const updateDB = async lastTimestamp => {
  console.log('Fetching exchangeDayDatas');
  const exchangeDayDatas = await fetchExchangeDataAfterDate(lastTimestamp);
  await processExchangeData(exchangeDayDatas);
  console.log('Fetching ETH/USD timeseries');
  const ETH_USDdata = await fetchTimeseries('ETH', 'USD');
  await processETH_USDdata(ETH_USDdata);
  console.log(`Got ${ETH_USDdata.length} days`);
};

module.exports = updateDB;
