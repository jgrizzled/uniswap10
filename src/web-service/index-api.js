// router for folders endpoint

const express = require('express');
const cors = require('cors');
const { addAsync } = require('@awaitjs/express');

const logger = require('../logger');

const indexAPI = addAsync(express.Router());

indexAPI.use(cors());

indexAPI.getAsync('/', async (req, res) => {
  // return index data for params
  // fetch(myurl/index?month=1,)
  // POST {month: 1}
  res.json({ index: [1], weightsByToken: [[1]], tokenIDs: [1] });
});

module.exports = indexAPI;
