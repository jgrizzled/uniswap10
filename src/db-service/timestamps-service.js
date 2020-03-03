// timestamps table
import db from './db.js';

const readAllTimestamps = async () =>
  (
    await db('timestamps')
      .select('*')
      .orderBy('timestamp', 'asc')
  ).map(t => ({ timestamp: Number(t.timestamp) }));

const createTimestamps = timestamps =>
  db.batchInsert(
    'timestamps',
    timestamps.map(timestamp => ({ timestamp }))
  );

const truncateTimestamps = () => db('timestamps').delete();

export { readAllTimestamps, createTimestamps, truncateTimestamps };
