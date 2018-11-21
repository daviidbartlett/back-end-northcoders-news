process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('/api', () => {
  let url = '/api/';
  beforeEach(() => {
    return connection.migrate
      .rollback()
      .then(() => connection.migrate.latest())
      .then(() => connection.seed.run());
  });
  after(() => {
    return connection.destroy();
  });

  it('GET returns 200 and welcome message', () => {
    return request
      .get(url)
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).to.equal('Welcome!');
      });
  });
  it('GET to incorrect path returns 404 and error message', () => {
    return request
      .get('/fishFingers')
      .expect(404)
      .then(({ body }) => expect(body.msg).to.equal('Page not found.'));
  });
  it('GET with incorrect method returns 405 and error message', () => {
    const invalidMethods = ['post', 'delete', 'put', 'patch'];
    return Promise.all(
      invalidMethods.map((method) => {
        request[method](url)
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal('Method not allowed on path.');
          });
      })
    );
  });

  describe('/topics', () => {
    url = '/api/topics';
    it('GET returns 200 and array of topic objects', () => {
      return request
        .get(url)
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics.length).to.equal(2);
          expect(body.topics[0]).to.eql({
            description: 'The man, the Mitch, the legend',
            slug: 'mitch',
          });
        });
    });
  });
});
