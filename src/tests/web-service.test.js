// web service integration tests

import env from '../config/env.js';
import webService from '../web-service/web-service.js';
import setupDB from './setup-db.js';

describe('web service', () => {
  // set up environment
  const postgrator = new Postgrator({
    migrationDirectory: 'migrations',
    driver: 'pg',
    connectionString: env.DATABASE_URL
  });

  before(async () => {
    // initialize db
    await postgrator.migrate('000');
    await postgrator.migrate('004');
    await setupDB();
  });

  it('GET /api/index returns index data', done => {
    supertest(webService)
      .get('/api/index?rp=2&p=2')
      .end((req, res) => {
        expect(res.statusCode).to.equal(200);
        const { index, weightsByAsset, dates, tokens } = res.body;
        expect(index).to.be.a('array');
        expect(weightsByAsset).to.be.a('array');
        expect(dates).to.be.a('array');
        expect(tokens).to.be.a('array');
        done();
      });
  });

  after(() => {
    //postgrator.migrate('000');
  });
});
