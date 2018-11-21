process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  it('GET returns 200 and welcome message', () => request
    .get('/api/')
    .expect(200)
    .then(({ body }) => {
      expect(body.msg).to.equal('Welcome!');
    }));

  it('GET to incorrect path returns 404 and error message', () => request
    .get('/fishFingers')
    .expect(404)
    .then(({ body }) => expect(body.msg).to.equal('Page not found.')));

  it('incorrect METHOD returns 405 and error message', () => {
    const invalidMethods = ['post', 'delete', 'put', 'patch'];
    return Promise.all(
      invalidMethods.map(method => request[method]('/api/')
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal('Method not allowed on path.');
        })),
    );
  });

  describe('/topics', () => {
    describe('/', () => {
      const url = '/api/topics';
      it('GET returns 200 and array of topic objects', () => request
        .get(url)
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics).to.be.an('array');
          expect(topics.length).to.equal(2);
          topics.forEach((topic) => {
            expect(topic).have.keys(['slug', 'description']);
          });
          expect(topics[0]).to.eql({
            description: 'The man, the Mitch, the legend',
            slug: 'mitch',
          });
        }));
      it('POST returns 201 and posted object', () => request
        .post(url)
        .send({
          slug: 'snail',
          description: 'A snail is a homeowner.',
        })
        .expect(201)
        .then(({ body: { newTopic } }) => {
          expect(newTopic).to.be.an('object');
          expect(newTopic).to.have.keys(['slug', 'description']);
        }));
      it('POST with malformed body returns 400 and error message', () => request
        .post(url)
        .send({
          description: 'A snail is a homeowner.',
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Malformed body, ensure posted data is of correct format.');
        }));
      it('POST with non-unique slug returns 422 and error message', () => request
        .post(url)
        .send({
          description: 'The man, the Mitch, the legend',
          slug: 'mitch',
        })
        .expect(422)
        .then(({ body }) => {
          expect(body.msg).to.equal('Key (slug)=(mitch) already exists.');
        }));

      it('incorrect METHOD returns 405 and error message', () => {
        const invalidMethods = ['delete', 'put', 'patch'];
        return Promise.all(
          invalidMethods.map(method => request[method](url)
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('Method not allowed on path.');
            })),
        );
      });
    });
    describe('/:topic/articles', () => {
      const url = '/api/topics/mitch/articles';
      const keyArr = [
        'author',
        'title',
        'article_id',
        'votes',
        'created_at',
        'topic',
        'comment_count',
      ];
      it('GET returns 200 and array of articles for given topic id', () => request
        .get(url)
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.an('array');
          expect(articles[0]).to.have.keys(keyArr);
        }));
      it('GET returns 200 and single object if topic with single article', () => request
        .get('/api/topics/cats/articles')
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).to.not.be.an('array');
          expect(article).to.have.keys(keyArr);
        }));
      it('GET with non-existent topic returns 404 and error message', () => request
        .get('/api/topics/spoon/articles')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Topic not found.');
        }));
      it('GET with incorrect data-type parameter returns 400 and error message', () => request
        .get('/api/topics/1/articles')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Incorrect data type, please use string.');
        }));
      it('incorrect METHOD returns 405 and error message', () => {
        const invalidMethods = ['post', 'delete', 'put', 'patch'];
        return Promise.all(
          invalidMethods.map(method => request[method](url)
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('Method not allowed on path.');
            })),
        );
      });
    });
  });
});
