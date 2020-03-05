// exchange_day_datas table
import db from './db.js';

const createDayDatas = dayDatas =>
  db.batchInsert(
    'exchange_day_datas',
    dayDatas.map(({ tokenID, timestamp, liquidity, volume, ethPrice }) => ({
      token_id: tokenID,
      timestamp,
      liquidity,
      volume,
      eth_price: ethPrice
    }))
  );

const readAllDayDatas = () =>
  db('exchange_day_datas')
    .select('*')
    .map(d => ({
      tokenID: d.token_id,
      timestamp: Number(d.timestamp),
      liquidity: Number(d.liquidity),
      volume: Number(d.volume),
      ethPrice: Number(d.eth_price)
    }));

const readDayDataByTokenID = async id => {
  const data = await db('exchange_day_datas')
    .select('*')
    .where({ token_id: id })
    .orderBy('timestamp', 'asc');
  return data.map(d => ({
    timestamp: Number(d.timestamp),
    liquidity: Number(d.liquidity),
    volume: Number(d.volume),
    ethPrice: Number(d.eth_price)
  }));
};

const readDayDataByTimestamp = async timestamp => {
  const data = await db('exchange_day_datas')
    .select('*')
    .where({ timestamp });
  return data.map(d => ({
    tokenID: d.token_id,
    liquidity: Number(d.liquidity),
    volume: Number(d.volume),
    ethPrice: Number(d.eth_price)
  }));
};

const updateDayData = dayData =>
  db('exchange_day_datas')
    .update({
      eth_price: dayData.ethPrice,
      volume: dayData.volume,
      liquidity: dayData.liquidity
    })
    .where({ timestamp: dayData.timestamp, token_id: dayData.tokenID });

const truncateDayDatas = () => db.truncate('exchange_day_datas');

export {
  createDayDatas,
  readAllDayDatas,
  readDayDataByTokenID,
  readDayDataByTimestamp,
  updateDayData,
  truncateDayDatas
};
