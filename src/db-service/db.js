import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const db = knex({
  client: 'pg',
  connection:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
  supportBigNumbers: false,
  bigNumberStrings: false
});

export default db;
