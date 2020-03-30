import knex from 'knex';
import env from '../config/env.js';

const db = knex({
  client: 'pg',
  connection: env.DATABASE_URL,
  supportBigNumbers: false,
  bigNumberStrings: false
});

export default db;
