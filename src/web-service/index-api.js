// router for index timeseries API

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

  // default options
  const options = {
    top: 10,
    period: 365,
    liquidityWeight: 0.5,
    volumeWeight: 0.5,
    rebalancePeriod: 30,
    weightDivisor: 100
  };

  // rebalance period param (# days)
  if (req.query.rp) {
    const rpn = Number(req.query.rp);
    if (isNaN(rpn) || rpn < 0 || rpn > 365)
      res.json({ error: 'invalid rebalance period' });
    options.rebalancePeriod = rpn;
  }

  // liquidity/volume weight param
  // 1 = all liquidity, 0.5 = half each, 0 = all volume
  if (req.query.lw) {
    const lwn = Number(req.query.lw);
    if (isNaN(lwn) || lwn < 0 || lwn > 1)
      res.json({ error: 'invalid liquidity/volume weight' });
    options.liquidityWeight = lwn;
    options.volumeWeight = 1 - lwn;
  }

  // period lookback param (# days)
  if (req.query.p) {
    const pn = Number(req.query.p);
    if (isNaN(pn) || pn < 1 || pn > 365) res.json({ error: 'invalid period' });
    options.period = pn;
  }

  const { indexETH, indexUSD, dates, tokens, weightsByAsset } = await calcIndex(
    options
  );

  let currency = 'usd';

  if (req.query.c) {
    if (req.query.c !== 'usd' && req.query.c !== 'eth')
      res.json({ error: 'invalid currency' });
    currency = req.query.c;
  }

  let index;
  if (currency === 'eth') index = indexETH;
  if (currency === 'usd') index = indexUSD;

  res.json({
    index,
    weightsByAsset,
    dates,
    tokens
  });
  logger.info('sent index');
});

export default indexAPI;
