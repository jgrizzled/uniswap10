import dotenv from 'dotenv';
dotenv.config();

export default {
  PORT: process.env.PORT || 8000,
  DATABASE_URL:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
  AV_API_KEY: process.env.AV_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
