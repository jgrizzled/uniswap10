# Uniswap10 Server

Back end API for Uniswap10 - a customizeable index of liquid cryptoasets traded on [Uniswap](https://uniswap.io).

[Live Demo](https://uniswap10.now.sh)

Technologies: Node, Express, Postgres, GraphQL

Data sources: [The Graph](https://thegraph.com), [AlphaVantage](https://www.alphavantage.co/)

## Install

1. `yarn install`

2. `cp sample.env .env`

3. Create prod and test databases in Postgres

4. Put database URLs in .env

5. [Create AlphaVantage API key](https://www.alphavantage.co/support/#api-key)

6. Put AV API key in .env

7. Migrate DB: `yarn migrate`

8. (Production) Schedule cron job to run `yarn update-db` every 24h

## Scripts

Start server: `yarn start`

Develop: `yarn dev`

Fetch new data and update DB: `yarn update-db`

Migrate up DB: `yarn migrate`

Truncate DB: `yarn truncate`

Deploy to Heroku (must set up first): `yarn deploy`

Generate CSV file of Uniswap10 Index: `yarn csv`

## Set up Heroku Deployment

1. `heroku create`

2. `heroku addons:create heroku-postgresql:hobby-dev`

3. `yarn migrate:production`

4. `heroku addons:create scheduler:standard`

5. Configure scheduler on Heroku dashboard to run `yarn update-db` every 24 hr

6. `heroku config:set AV_API_KEY=<your API key>`

7. `yarn deploy`
