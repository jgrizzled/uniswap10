// router for folders endpoint

import express from 'express';
import cors from 'cors';
import ajs from '@awaitjs/express';
const { addAsync } = ajs;
import moment from 'moment';
import logger from '../logger.js';
import calcIndex from '../index/calc-index.js';

const indexAPI = addAsync(express.Router());

indexAPI.use(cors());

indexAPI.getAsync('/index', async (req, res) => {
  logger.info('calculating index');
  // return index data for params
  // fetch(myurl/index?month=1,)
  // POST {month: 1}
  const options = {
    top: 10,
    period: 200,
    liquidityWeight: 0.5,
    volumeWeight: 0.5,
    rebalancePeriod: 30,
    weightDivisor: 100
  };
  const results = await calcIndex(options);
  res.json(results);
  logger.info('sent index');
});

export default indexAPI;
