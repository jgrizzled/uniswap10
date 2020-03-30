// populate db with dummy data

import moment from 'moment';

import { createTimestamps } from '../db-service/timestamps-service.js';
import { createETH_USDprices } from '../db-service/ethusd-service.js';
import { createTokens } from '../db-service/tokens-service.js';
import { createDayDatas } from '../db-service/exchange-data-service.js';

export default async function setupDB() {
  const timestamps = [
    moment()
      .subtract(3, 'days')
      .unix(),
    moment()
      .subtract(2, 'days')
      .unix(),
    moment()
      .subtract(1, 'days')
      .unix(),
    moment().unix()
  ];
  await createTimestamps(timestamps);

  const ETH_USDprices = [
    {
      price: 100,
      timestamp: timestamps[0]
    },
    {
      price: 110,
      timestamp: timestamps[1]
    },
    {
      price: 120,
      timestamp: timestamps[2]
    },
    {
      price: 130,
      timestamp: timestamps[3]
    }
  ];
  await createETH_USDprices(ETH_USDprices);

  const tokens = [
    {
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      symbol: 'ZRX',
      name: '0x Protocol Token',
      exchangeAddresses: ['0xae76c84c9262cdb9abc0c2c8888e62db8e22a0bf']
    },
    {
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      symbol: 'MKR',
      name: 'Maker',
      exchangeAddresses: ['0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2']
    }
  ];
  const tokenIDs = await createTokens(tokens);

  const dayDatas = [
    {
      timestamp: timestamps[0],
      tokenID: tokenIDs[0],
      ethPrice: 1,
      volume: 1,
      liquidity: 1
    },
    {
      timestamp: timestamps[1],
      tokenID: tokenIDs[0],
      ethPrice: 1.1,
      volume: 1,
      liquidity: 1
    },
    {
      timestamp: timestamps[2],
      tokenID: tokenIDs[0],
      ethPrice: 1.2,
      volume: 1,
      liquidity: 1
    },
    {
      timestamp: timestamps[3],
      tokenID: tokenIDs[0],
      ethPrice: 1.3,
      volume: 1,
      liquidity: 1
    },
    {
      timestamp: timestamps[0],
      tokenID: tokenIDs[1],
      ethPrice: 2,
      volume: 2,
      liquidity: 2
    },
    {
      timestamp: timestamps[1],
      tokenID: tokenIDs[1],
      ethPrice: 1.9,
      volume: 2,
      liquidity: 2
    },
    {
      timestamp: timestamps[2],
      tokenID: tokenIDs[1],
      ethPrice: 1.8,
      volume: 2,
      liquidity: 2
    },
    {
      timestamp: timestamps[3],
      tokenID: tokenIDs[1],
      ethPrice: 1.7,
      volume: 2,
      liquidity: 2
    }
  ];
  await createDayDatas(dayDatas);
}
