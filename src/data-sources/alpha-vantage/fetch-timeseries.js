// Crypto exchange rate fetchers for AlphaVantage.co

import fetch from 'node-fetch';
import moment from 'moment';
import dotenv from 'dotenv';
dotenv.config();
const key = process.env.AV_API_KEY;

// Fetch an exchange rate timeseries for a pair, going back a few years
const fetchTimeseries = async (denomSymbol, quoteSymbol) => {
  console.log(
    `Fetching time series for ${denomSymbol}/${quoteSymbol} from AlphaVantage`
  );
  var response = await fetch(
    `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${denomSymbol}&market=${quoteSymbol}&apikey=${key}`
  );
  if (!response.ok)
    throw new Error('AlphaVantage response error ' + JSON.stringify(response));
  const responseJSON = await response.json();
  if (responseJSON.hasOwnProperty('Error Message'))
    throw new Error('AlphaVantage API error: ' + responseJSON['Error Message']);
  if (!responseJSON.hasOwnProperty('Time Series (Digital Currency Daily)')) {
    if (
      responseJSON.hasOwnProperty('Note') &&
      responseJSON.Note.includes('call frequency')
    )
      throw new Error('AlphaVantage API rate limit hit');
    throw new Error(
      'AlphaVantage rates not found ' + JSON.stringify(responseJSON)
    );
  }
  const ratesData = [];
  for (const day of Object.keys(
    responseJSON['Time Series (Digital Currency Daily)']
  )) {
    const dayResponse =
      responseJSON['Time Series (Digital Currency Daily)'][day];
    if (dayResponse.hasOwnProperty(`4a. close (${quoteSymbol})`)) {
      const dayValue = Number(dayResponse[`4a. close (${quoteSymbol})`]);
      if (dayValue > 0)
        ratesData.push({
          timestamp: moment(day).unix(),
          price: dayValue
        });
    }
  }
  if (ratesData.length === 0) throw new Error('AlphaVantage no prices found');
  return ratesData;
};

export default fetchTimeseries;
