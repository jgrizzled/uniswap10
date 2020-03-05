import fetchSubgraphQuery from './fetch-subgraph-query.js';
import ignoredTokens from '../../config/ignored-tokens.js';
import logger from '../../logger.js';

const uniswapSubgraph = 'graphprotocol/uniswap';
const fetchUniswapSubgraph = query =>
  fetchSubgraphQuery(uniswapSubgraph, query);

const fetchExchangeIDsByTokens = async addresses => {
  const query = `{
    exchanges(first: 1000, where:{tokenAddress_in: ${JSON.stringify(
      addresses
    )}}) {
      id
    }
  }`;
  return (await fetchUniswapSubgraph(query)).exchanges.map(e => e.id);
};

const buildExchangeDataQuery = (date, ignoredExchanges, skip = 0) =>
  `{
      exchangeDayDatas(
        first: 1000, 
        skip: ${skip} 
        orderBy: date, 
        orderDirection: asc, 
        where: {
          date_gt: ${date},
          exchangeAddress_not_in: 
            ${JSON.stringify(ignoredExchanges)},
          ethVolume_gte: 100,
          ethBalance_gte: 100
        }) {
          timestamp: date
          exchangeAddress
          ethBal: ethBalance
          tokenBal: tokenBalance
          ethRate: marginalEthRate
          ethVol: ethVolume
      }
    }`;

const buildExchangeTokensQuery = addrs => {
  const tokenQuery = addr =>
    // remove leading '0'
    `${addr.substring(1)}: exchange(id:"${addr}") {
        address: tokenAddress
        symbol: tokenSymbol
        name: tokenName
      }`;
  return addrs.reduce((query, addr) => query + tokenQuery(addr), '{') + '}';
};

const fetchExchangeDataAfterDate = async date => {
  // get ignored addresses
  const ignoredExAddrs = await fetchExchangeIDsByTokens(ignoredTokens);

  let fetchedExchangeDayDatas = [];
  let skip = 0;
  const exchangeDayDatas = [];
  do {
    const query = buildExchangeDataQuery(date, ignoredExAddrs, skip);
    fetchedExchangeDayDatas = (await fetchUniswapSubgraph(query))
      .exchangeDayDatas;

    exchangeDayDatas.push(...fetchedExchangeDayDatas);

    logger.info(
      `Fetched ${fetchedExchangeDayDatas.length} exchangeDayDatas, total ${exchangeDayDatas.length}`
    );

    skip += 1000;
  } while (fetchedExchangeDayDatas.length === 1000);
  return exchangeDayDatas;
};

// TODO: batch these capped at 1000 addresses
const fetchExchangeTokens = async exchangeAddrs => {
  const query = buildExchangeTokensQuery(exchangeAddrs);
  const data = await fetchUniswapSubgraph(query);
  const tokens = exchangeAddrs.map(a => ({
    ...data[a.substring(1)],
    exchangeAddress: a
  }));
  logger.info(`Fetched ${tokens.length} tokens`);
  return tokens;
};

export { fetchExchangeDataAfterDate, fetchExchangeTokens };
