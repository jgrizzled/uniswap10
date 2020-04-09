# Uniswap10 Server

Back end API for Uniswap10 - a customizeable index of cryptocurrencies traded on [Uniswap](https://uniswap.io). Track the top cryptocurrencies on the most popular decentralized exchange.

Uniswap10 is an index representing the hypothetical investment performance of a liquidity-weighted allocation strategy. Get broad exposure to the DeFi ecosystem by following market trends. Customize the strategy parameters to fit your trading style.

[Live Demo](https://uniswap10.now.sh)

Technologies: Node, Express, Postgres, GraphQL

Data sources: [The Graph](https://thegraph.com), [AlphaVantage](https://www.alphavantage.co/)

[Client Repository](https://github.com/jgrizzled/uniswap10-client)

## Install

<span style="color:red">_Requires Node.js 13.2.0 or later_</span>

1. `yarn install` or `npm install`

2. `cp sample.env .env`

3. Create prod and test databases in Postgres

4. Put database URLs in .env

5. [Create AlphaVantage API key](https://www.alphavantage.co/support/#api-key)

6. Put AV API key in .env

7. Migrate DB: `yarn migrate` or `npm migrate`

8. (Production) Schedule cron job to run `yarn update-db` or `npm update-db` every 24h

## Scripts

Start server: `yarn start` or `npm run start`

Develop: `yarn dev` or `npm dev`

Fetch new data and update DB: `yarn update-db` or `npm update-db`

Migrate up DB: `yarn migrate` or `npm migrate`

Truncate DB: `yarn truncate` or `npm run truncate`

Deploy to Heroku (must set up first): `yarn deploy` or `npm run deploy`

Generate CSV file of Uniswap10 Index: `yarn csv` or `npm csv`

## API

`/api/index`

Query params:

**rp**

- Strategy rebalance period
- integer 1 - 365

**lw**

- Liquidity weight factor (0 = use volume only)
- integer 0 - 1

**c**

- base currency
- 'usd' or 'eth'

## Set up Heroku Deployment

1. `heroku create`

2. `heroku addons:create heroku-postgresql:hobby-dev`

3. `yarn migrate:production` or `npm migrate:production`

4. `heroku addons:create scheduler:standard`

5. Configure scheduler on Heroku dashboard to run `yarn update-db` or `npm update-db` every 24 hr

6. `heroku config:set AV_API_KEY=<your API key>`

7. `yarn deploy` or `npm run deploy`

8. `heroku ps:scale web=1`
