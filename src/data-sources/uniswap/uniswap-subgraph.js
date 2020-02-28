const fetchSubgraphQuery = require('./fetch-subgraph-query');
const ignoredTokens = require('../../config/ignored-tokens');

const uniswapSubgraph = 'graphprotocol/uniswap';
const fetchUniswapSubgraph = query =>
  fetchSubgraphQuery(uniswapSubgraph, query);

const buildExchangeLookupQuery = addresses =>
  `{
    exchanges(first: 1000, where:{tokenAddress_in: ${JSON.stringify(
      addresses
    )}}) {
      id
    }
  }`;

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
            ${JSON.stringify(ignoredExchanges)}
          
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
  const ignoreQuery = buildExchangeLookupQuery(ignoredTokens);
  const ignoredExchanges = await fetchUniswapSubgraph(ignoreQuery);
  const ignoredAddrs = ignoredExchanges.exchanges.map(e => e.id);

  let fetchedExchangeDayDatas = [];
  let skip = 0;
  const exchangeDayDatas = [];
  do {
    const query = buildExchangeDataQuery(date, ignoredAddrs, skip);
    fetchedExchangeDayDatas = (await fetchUniswapSubgraph(query))
      .exchangeDayDatas;

    exchangeDayDatas.push(...fetchedExchangeDayDatas);

    console.log(
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
  console.log(`Fetched ${tokens.length} tokens`);
  return tokens;
};

module.exports = {
  fetchExchangeDataAfterDate,
  fetchExchangeTokens
};
