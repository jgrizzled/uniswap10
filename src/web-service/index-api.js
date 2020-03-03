// router for folders endpoint

import express from 'express';
import cors from 'cors';
import ajs from '@awaitjs/express';
const { addAsync } = ajs;
import logger from '../logger.js';

const indexAPI = addAsync(express.Router());

indexAPI.use(cors());

indexAPI.getAsync('/', async (req, res) => {
  // return index data for params
  // fetch(myurl/index?month=1,)
  // POST {month: 1}
  res.json({ index: [1], weightsByToken: [[1]], tokenIDs: [1] });
});

export default indexAPI;
