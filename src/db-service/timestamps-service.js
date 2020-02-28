// timestamps table
const db = require('./db');

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

module.exports = {
  readAllTimestamps,
  createTimestamps,
  truncateTimestamps
};
