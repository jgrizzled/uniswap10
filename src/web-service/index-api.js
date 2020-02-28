// router for folders endpoint

const express = require('express');
const cors = require('cors');
const { addAsync } = require('@awaitjs/express');

const logger = require('../logger');

const indexAPI = addAsync(express.Router());

indexAPI.use(cors());

indexAPI.getAsync('/', async (req, res) => {
  // return index data for params
  res.json({});
});

module.exports = indexAPI;
