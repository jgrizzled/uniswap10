// router for folders endpoint

import express from 'express';
import cors from 'cors';
import ajs from '@awaitjs/express';
const { addAsync } = ajs;
import logger from '../logger.js';
import calcIndex from '../index/calc-index.js';

const indexAPI = addAsync(express.Router());

indexAPI.use(cors());

indexAPI.getAsync('/index', async (req, res) => {
  logger.info('calculating index');
  // return index data for params
  // fetch(myurl/index?month=1,)
  // POST {month: 1}
  // rebalance period = 1 week, 1 month
  // all liquidity, all volume, or 50-50

  // default options
  const options = {
    top: 10,
    period: 365,
    liquidityWeight: 0.5,
    volumeWeight: 0.5,
    rebalancePeriod: 30,
    weightDivisor: 100
  };

  // rebalance period param
  if (req.query.rp) {
    const rpn = Number(req.query.rp);
    if (isNaN(rpn) || rpn !== 7 || rpn !== 30)
      res.json({ error: 'invalid rebalance period' });
    options.rebalancePeriod = rpn;
  }

  // liquidity/volume weight param
  // 1 = all liquidity, 0.5 = half each, 0 = all volume
  if (req.query.l) {
    const ln = Number(req.query.l);
    if (isNaN(ln) || ln !== 0 || ln !== 0.5 || ln !== 1)
      res.json({ error: 'invalid liquidity/volume weight' });
    options.liquidityWeight = lvn;
    options.volumeWeight = 1 - lvn;
  }

  const results = await calcIndex(options);
  res.json(results);
  logger.info('sent index');
});

export default indexAPI;
