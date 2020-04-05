// timestamps table
import db from './db.js';

const readAllTimestamps = async () =>
  (await db('timestamps').select('*').orderBy('timestamp', 'asc')).map((t) => ({
    timestamp: Number(t.timestamp),
  }));

const readLatestTimestamp = async () => {
  const t = await db('timestamps')
    .select('*')
    .orderBy('timestamp', 'desc')
    .first();
  if (t) return Number(t.timestamp);
  return null;
};

const createTimestamps = (timestamps) =>
  db.batchInsert(
    'timestamps',
    timestamps.map((timestamp) => ({ timestamp }))
  );

const truncateTimestamps = () => db('timestamps').delete();

export {
  readAllTimestamps,
  readLatestTimestamp,
  createTimestamps,
  truncateTimestamps,
};
