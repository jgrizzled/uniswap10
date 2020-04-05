// router for index timeseries API

import express from 'express';
import cors from 'cors';
import ajs from '@awaitjs/express';
const { addAsync } = ajs;
import moment from 'moment';

import calcIndex from '../index/calc-index.js';
import { readLatestTimestamp } from '../db-service/timestamps-service.js';

// cache index calculations in memory
const cache = new Map();

const indexAPI = addAsync(express.Router());

indexAPI.use(cors());

indexAPI.getAsync('/index', async (req, res) => {
  // default options
  const options = {
    top: 10,
    period: 365,
    liquidityWeight: 0.5,
    volumeWeight: 0.5,
    rebalancePeriod: 30,
    weightDivisor: 100,
  };

  // rebalance period param (# days)
  if (req.query.rp) {
    const rpn = Number(req.query.rp);
    if (isNaN(rpn) || rpn < 0 || rpn > 365)
      return res.status(400).json({ error: 'invalid rebalance period' });
    options.rebalancePeriod = rpn;
  }

  // liquidity/volume weight param
  // 1 = all liquidity, 0.5 = half each, 0 = all volume
  if (req.query.lw) {
    const lwn = Number(req.query.lw);
    if (isNaN(lwn) || lwn < 0 || lwn > 1)
      return res.status(400).json({ error: 'invalid liquidity/volume weight' });
    options.liquidityWeight = lwn;
    options.volumeWeight = 1 - lwn;
  }

  // lookback period param (# days)
  if (req.query.p) {
    const pn = Number(req.query.p);
    if (isNaN(pn) || pn < 1 || pn > 365)
      return res.status(400).json({ error: 'invalid period' });
    options.period = pn;
  }

  // cache
  const key = JSON.stringify(options);
  const latestTimestamp = await readLatestTimestamp();
  // remove stale results
  for (let [k, v] of cache) {
    if (v.latestTimestamp != latestTimestamp) cache.delete(k);
  }
  let result = {};
  if (cache.has(key)) {
    console.log('Serving from cache');
    result = cache.get(key).result;
  } else {
    console.log('Running backtest');
    result = await calcIndex(options);
    cache.set(key, { latestTimestamp, result });
    console.log('Cached results: ' + cache.size);
  }

  const { indexETH, indexUSD, dates, tokens, weightsByAsset } = result;

  // display currency param (eth,usd)
  let currency = 'usd';
  if (typeof req.query.c === 'string') {
    if (
      req.query.c.toLowerCase() !== 'usd' &&
      req.query.c.toLowerCase() !== 'eth'
    )
      res.json({ error: 'invalid currency' });
    currency = req.query.c.toLowerCase();
  }

  let index;
  if (currency === 'eth') index = indexETH;
  if (currency === 'usd') index = indexUSD;

  // enable client-side caching
  // 24 + 1 hr buffer
  const expires = moment.unix(latestTimestamp).add(25, 'h');
  console.log('Expires: ' + expires.toString());
  res.set('Cache-Control', 'public');
  res.set('Expires', expires.toString());

  res.json({
    index,
    weightsByAsset,
    dates,
    tokens,
  });
});

export default indexAPI;
