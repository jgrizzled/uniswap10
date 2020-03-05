// tokens table
import db from './db.js';

const createTokens = tokens =>
  db('tokens')
    .insert(
      tokens.map(({ address, symbol, name, exchangeAddresses }) => ({
        address,
        symbol,
        name,
        exchange_addresses: exchangeAddresses
      }))
    )
    .returning('id');

const readTokenByID = id =>
  db('tokens')
    .select(
      'name',
      'symbol',
      'address',
      'exchange_addresses as exchangeAddresses'
    )
    .where({ id })
    .first();

const readTokenByExchangeAddress = ex =>
  db('tokens')
    .select(
      'id',
      'name',
      'symbol',
      'address',
      'exchange_addresses as exchangeAddresses'
    )
    .whereRaw('?=ANY(exchange_addresses)', [ex])
    .first();

const readAllTokens = () =>
  db('tokens').select(
    'id',
    'name',
    'symbol',
    'address',
    'exchange_addresses as exchangeAddresses'
  );

const updateTokenByID = (id, token) =>
  db('tokens')
    .update({
      name: token.name,
      symbol: token.symbol,
      address: token.address,
      exchange_addresses: token.exchangeAddresses
    })
    .where({ id });

const truncateTokens = async () => {
  await db('tokens').delete();
  return db.raw('ALTER SEQUENCE tokens_id_seq RESTART WITH 1');
};

export {
  createTokens,
  readTokenByID,
  readTokenByExchangeAddress,
  readAllTokens,
  updateTokenByID,
  truncateTokens
};
