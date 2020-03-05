// process and add new exchangeDayData to db

import {
  readAllTokens,
  createTokens,
  readTokenByExchangeAddress,
  updateTokenByID
} from '../../db-service/tokens-service.js';
import {
  readAllTimestamps,
  createTimestamps
} from '../../db-service/timestamps-service.js';
import {
  readAllDayDatas,
  createDayDatas,
  updateDayData
} from '../../db-service/exchange-data-service.js';
import { fetchExchangeTokens } from './uniswap-subgraph.js';
import logger from '../../logger.js';

const processExchangeData = async exchangeData => {
  let formattedData = formatExchangeData(exchangeData);

  const uniqueExchangeAddrs = [
    ...new Set(formattedData.map(e => e.exchangeAddress))
  ];

  // get existing db tokens
  const existingTokens = await readAllTokens();

  // lookup exchange addrs in db
  const newExchanges = [];
  for (const ex of uniqueExchangeAddrs) {
    if (!existingTokens.some(t => t.exchangeAddresses.includes(ex)))
      newExchanges.push(ex);
  }

  if (newExchanges.length > 0) {
    // fetch token info for exchanges
    const tokens = await fetchExchangeTokens(newExchanges);

    // find new tokens
    const newTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      // check for duplicate exchanges
      const addrMatch = existingTokens.find(
        tok => tok.address === tokens[i].address
      );
      if (addrMatch) {
        await updateTokenByID(addrMatch.id, {
          exchangeAddresses: [...addrMatch.exchangeAddresses, newExchanges[i]]
        });
        continue;
      }

      const symMatch = existingTokens.find(
        tok => tokens[i].symbol.toUpperCase() === tok.symbol.toUpperCase()
      );
      if (!symMatch)
        newTokens.push({ ...tokens[i], exchangeAddresses: [newExchanges[i]] });
      else {
        // token shares a symbol with existing token, just assume it is the same one with new ERC20 contract address
        logger.info(
          `merging tokens - old: ${symMatch.name} ${symMatch.address} new: ${tokens[i].name} ${tokens[i].address}`
        );
        await updateTokenByID({
          id: symMatch.id,
          exchangeAddresses: [...symMatch.exchangeAddresses, newExchanges[i]],
          name: symMatch.name,
          symbol: symMatch.symbol,
          address: tokens[i].address
        });
      }
    }

    if (newTokens.length > 0) {
      // dedupe new tokens with same symbol, assume later ones are new address
      const dedupedNewTokens = [];
      for (const t of newTokens) {
        const match = dedupedNewTokens.find(
          tok => tok.symbol.toUpperCase() === t.symbol.toUpperCase()
        );
        if (!match) dedupedNewTokens.push(t);
        else {
          logger.info(
            `merging new tokens - old: ${match.name} ${match.address} new: ${t.name} ${t.address}`
          );
          logger.info('Assuming same new tokens', match, t);
          match.address = t.address;
          match.exchangeAddresses.push(...t.exchangeAddresses);
        }
      }

      // add new tokens to db
      await createTokens(dedupedNewTokens);
    }
  }

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
  if (newTimestamps.length > 0) await createTimestamps(newTimestamps);

  // get existing day data
  const existingDayDatas = await readAllDayDatas();

  const mergeDays = (orig, newer) => {
    // data is for existing token/day, update db
    const merged = {
      timestamps: orig.timestamp,
      tokenID: orig.tokenID
    };
    if (newer.volume + newer.liquidity === 0) return orig;
    if (orig.volume + orig.liquidity === 0) {
      // replace day data
      merged.ethPrice = newer.ethPrice;
      merged.liquidity = newer.liquidity;
      merged.volume = newer.volume;
    } else {
      // merge day data
      // Pw = 0.5(P1*V1 + P2*V2)/Vt + 0.5(P1*L1 + P2*L2)/Lt
      const totalVolume = orig.volume + newer.volume || 1;
      const totalLiquidity = orig.liquidity + orig.volume || 1;
      const weightedPrice =
        0.5 *
        ((orig.ethPrice * orig.volume + newer.ethPrice * newer.volume) /
          totalVolume +
          (orig.ethPrice * orig.liquidity + newer.ethPrice * newer.liquidity) /
            totalLiquidity);

      merged.ethPrice = weightedPrice;
      merged.liquidity = totalLiquidity;
      merged.volume = totalVolume;
    }
    return merged;
  };

  const newDayDatas = [];
  for (const newDay of formattedData) {
    // check if equivalent token day exists in db
    const token = await readTokenByExchangeAddress(newDay.exchangeAddress);
    if (!token)
      throw new Error(`no token found for exchange ${newDay.exchangeAddress}`);
    const tokenID = token.id;
    const match = existingDayDatas.find(
      ed => ed.timestamp == newDay.timestamp && ed.tokenID == tokenID
    );

    if (!match) {
      // check if equivalent token day exists in new data
      const newMatch = newDayDatas.find(
        d => d.timestamp == newDay.timestamp && d.tokenID == tokenID
      );
      if (newMatch) {
        // merge new day into array
        const mergedDay = mergeDays(newMatch, newDay);
        newMatch.ethPrice = mergedDay.ethPrice;
        newMatch.volume = mergedDay.volume;
        newMatch.liquidity = mergedDay.liquidity;
      } else newDayDatas.push({ ...newDay, tokenID });
    } else {
      // merge new day into db
      const mergedDay = mergeDays(match, newDay);
      await updateDayData(mergedDay);
    }
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
