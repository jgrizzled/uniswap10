// tokens table
const db = require('./db');

const createTokens = tokens =>
  db('tokens')
    .insert(
      tokens.map(({ address, symbol, name, exchangeAddress }) => ({
        address,
        symbol,
        name,
        exchange_address: exchangeAddress
      }))
    )
    .returning('id');

const readTokenByID = id =>
  db('tokens')
    .select('*')
    .where({ id })
    .first();

const readTokenByExchangeAddress = ex =>
  db('tokens')
    .select('*')
    .where({ exchange_address: ex })
    .first();

const readAllTokens = () => db('tokens').select('*');

const truncateTokens = async () => {
  await db('tokens').delete();
  return db.raw('ALTER SEQUENCE tokens_id_seq RESTART WITH 1');
};

module.exports = {
  createTokens,
  readTokenByID,
  readTokenByExchangeAddress,
  readAllTokens,
  truncateTokens
};
