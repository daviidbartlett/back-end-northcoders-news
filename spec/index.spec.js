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
      expect(body.api).to.have.keys(['/api/', 'topics', 'articles', 'comments', 'users']);
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
      const getKeyArr = [
        'author',
        'title',
        'article_id',
        'votes',
        'created_at',
        'topic',
        'comment_count',
      ];
      const postKeyArr = ['article_id', 'body', 'created_at', 'title', 'topic', 'user_id', 'votes'];
      it('GET returns 200 and array of articles for given topic id', () => request
        .get(url)
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.an('array');
          expect(articles[0]).to.have.keys(getKeyArr);
        }));
      it('GET returns 200 and single object if topic with single article', () => request
        .get('/api/topics/cats/articles')
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).to.not.be.an('array');
          expect(article).to.have.keys(getKeyArr);
        }));
      it('GET with non-existent topic returns 404 and error message', () => request
        .get('/api/topics/spoon/articles')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Topic not found.');
        }));
      // it('GET with incorrect data-type parameter returns 400 and error message', () => request
      //   .get('/api/topics/1/articles')
      //   .expect(400)
      //   .then(({ body }) => {
      //     expect(body.msg).to.equal('Incorrect data type, please use string.');
      //   })); // NEED TO FINISH HERE???

      it('POST inserts comment into db returns 201 and new comment obj', () => request
        .post(url)
        .send({
          title: 'What even is a dog?',
          body: "I'm asking a question, someone please tell me!",
          user_id: 1,
        })
        .expect(201)
        .then(({ body: { newArticle } }) => {
          expect(newArticle).to.have.keys(postKeyArr);
          expect(newArticle.topic).to.equal('mitch');
          expect(newArticle.created_by).to.not.equal('null');
        }));
      it('POST with malformed obj returns 400 and error message', () => request
        .post(url)
        .send({
          dog: 'What even is a dog?',
          body: "I'm asking a question, someone please tell me!",
          user_id: 1,
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal('Malformed body, ensure posted data is of correct format.');
        }));
      it('POST at non-existent parametric endpoint returns 404 and error message', () => request
        .post('/api/topics/bobbins/articles')
        .send({
          title: 'What even is a dog?',
          body: "I'm asking a question, someone please tell me!",
          user_id: '1',
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal(
            'Parametric endpoint doesn\'t exist. Key (topic)=(bobbins) is not present in table "topics".',
          );
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

      describe('GET/:topic/articles QUERIES', () => {
        it('GET returns data with valid base query conditions', () => request
          .get(url)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(10);
            expect(articles[0].article_id).to.equal(1);
            expect(articles[9].article_id).to.equal(10);
          }));
        it('?limit=20 increases the max array length', () => request
          .get(`${url}?limit=20`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(11);
            expect(articles[10].article_id).to.equal(11);
          }));
        it('?sort_ascending=false returns array in descending order', () => request
          .get(`${url}?sort_ascending=false`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.equal(1);
            expect(articles[9].article_id).to.equal(10);
          }));
        it('?p=2 returns array containing data offset my limit', () => request
          .get(`${url}?p=2`)
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.not.be.an('array');
            expect(article.article_id).to.equal(11);
          }));
        it('?sort_by=article_id returns array containing data offset my limit', () => request
          .get(`${url}?sort_by=article_id`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.equal(12);
            expect(articles[9].article_id).to.equal(2);
          }));
        it('?BADQUERY is ignored and default queries are used', () => request
          .get(`${url}?cat=god`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(10);
            expect(articles[0].article_id).to.equal(1);
            expect(articles[9].article_id).to.equal(10);
          }));
      });
    });
  });
  describe('/articles', () => {
    describe('/', () => {
      const url = '/api/articles/';
      const getKeysArr = [
        'author',
        'title',
        'article_id',
        'votes',
        'comment_count',
        'created_at',
        'topic',
      ];
      it('GET returns 200 and array of article objects', () => request
        .get(url)
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.be.an('array');
          expect(articles[0]).to.have.keys(getKeysArr);
        }));
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
      describe('GET/articles/ QUERIES', () => {
        it('GET returns data with valid base query conditions', () => request
          .get(url)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(10);
            expect(articles[0].article_id).to.equal(12);
            expect(articles[9].article_id).to.equal(2);
          }));
        it('?limit=20 increases the max array length', () => request
          .get(`${url}?limit=20`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(12);
            expect(articles[11].article_id).to.equal(11);
          }));
        it('?sort_ascending=false returns array in descending order', () => request
          .get(`${url}?sort_ascending=true`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.equal(10);
            expect(articles[9].article_id).to.equal(6);
          }));
        it('?p=2 returns array containing data offset my limit', () => request
          .get(`${url}?p=2`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(2);
            expect(articles[1].article_id).to.equal(11);
          }));
        it('?sort_by=article_id returns array containing data offset by limit', () => request
          .get(`${url}?sort_by=article_id`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.equal(12);
            expect(articles[9].article_id).to.equal(3);
          }));
        it('?BADQUERY is ignored and default queries are used', () => request
          .get(`${url}?cat=god`)
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.equal(10);
            expect(articles[0].article_id).to.equal(12);
            expect(articles[9].article_id).to.equal(2);
          }));
      });
    });
    describe('/:articles_id', () => {
      const url = '/api/articles/1';
      const getKeyObj = [
        'article_id',
        'author',
        'title',
        'votes',
        'comment_count',
        'created_at',
        'topic',
      ];
      const patchKeyObj = [
        'article_id',
        'body',
        'created_at',
        'title',
        'topic',
        'user_id',
        'votes',
      ];
      it('GET returns 200 and article obj', () => request
        .get(url)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).to.have.keys(getKeyObj);
          expect(article.article_id).to.equal(1);
        }));
      it('GET with valid but non-existent article_id returns 404 and error message', () => request
        .get('/api/articles/345')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Article_id not found.');
        }));
      it('incorrect METHOD returns 405 and error message', () => {
        const invalidMethods = ['put'];
        return Promise.all(
          invalidMethods.map(method => request[method](url)
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('Method not allowed on path.');
            })),
        );
      });
      it('GET with invalid article_id returns 400 and error message', () => request
        .get('/api/articles/tuna-pasta-bake')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. article_id should be int.');
        }));
      it('PATCH returns 200 and updates the vote key of the article', () => request
        .patch(url)
        .send({ inc_votes: 100 })
        .then(() => request.patch(url).send({ inc_votes: -1 }))
        .then(({ body: { article } }) => {
          expect(article.votes).to.equal(199);
          expect(article).to.have.keys(patchKeyObj);
        }));
      it('PATCH with malformed body returns 400 and error message', () => request
        .patch(url)
        .send({ inc_votes: 'tree' })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. inc_vote should be of type int.');
        }));
      it('PATCH with invalid article_id returns 400 and error message', () => request
        .patch('/api/articles/tuna-pasta-bake')
        .send({ inc_votes: 100 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. article_id should be int.');
        }));
      it('PATCH with valid but non-existent article_id returns 404 and error message', () => request
        .patch('/api/articles/345')
        .send({ inc_votes: 100 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Article_id not found.');
        }));
      it('DELETE returns 200 and removes article returning empty object', () => request
        .delete(url)
        .then(({ body }) => {
          expect(body).to.eql({});
        })
        .then(() => request
          .get(url)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('Article_id not found.');
          })));
      it('DELETE with invalid article_id returns 400 and error message', () => request
        .delete('/api/articles/pamplemousse')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. article_id should be int.');
        }));
      it('DELETE with valid but non-existent article_id returns 404 and error message', () => request
        .get('/api/articles/345')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Article_id not found.');
        }));
    });
    describe('/:articles_id/comments', () => {
      const url = '/api/articles/1/comments';
      const getKeysObj = ['comment_id', 'votes', 'created_at', 'author', 'body'];
      const postKeysObj = ['article_id', 'user_id', 'body', 'comment_id', 'created_at', 'votes'];
      it('GET returns 200 and array of comments', () => request
        .get(url)
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).to.be.an('array');
          expect(comments[0]).to.have.keys(getKeysObj);
        }));
      it('GET with invalid article_id returns 400 and error message', () => request
        .get('/api/articles/huevos-rancheros/comments/')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. article_id should be int.');
        }));
      it('GET with valid but non-existent article_id returns 404 and error message', () => request
        .get('/api/articles/345/comments/')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('There are no comments found for that article.');
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
      describe('GET/:articles_id/comments QUERIES', () => {
        it('GET returns data with valid base query conditions', () => request
          .get(url)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(10);
            expect(comments[0].comment_id).to.equal(14);
            expect(comments[9].comment_id).to.equal(11);
          }));
        it('?limit=20 increases the max array length', () => request
          .get(`${url}?limit=20`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(13);
            expect(comments[12].comment_id).to.equal(15);
          }));
        it('?sort_ascending=false returns array in descending order', () => request
          .get(`${url}?sort_ascending=true`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments[0].comment_id).to.equal(15);
            expect(comments[9].comment_id).to.equal(11);
          }));
        it('?p=2 returns array containing data offset my limit', () => request
          .get(`${url}?p=2`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(3);
          }));
        it('?sort_by=comment_id returns array containing data offset my limit', () => request
          .get(`${url}?sort_by=comment_id`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments[0].comment_id).to.equal(15);
            expect(comments[9].comment_id).to.equal(4);
          }));
        it('?BADQUERY is ignored and default queries are used', () => request
          .get(`${url}?cat=god`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).to.equal(10);
            expect(comments[0].comment_id).to.equal(14);
            expect(comments[9].comment_id).to.equal(11);
          }));
      });
      it('POST returns 201 and posted obj', () => request
        .post(url)
        .send({ user_id: 1, body: 'poo' })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).to.have.keys(postKeysObj);
        }));

      it('POST with invalid article_id returns 400 and error message', () => request
        .post('/api/articles/huevos-rancheros/comments/')
        .send({ user_id: 1, body: 'poo' })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. article_id should be int.');
        }));
      it('POST with valid but non-existent article_id returns 404 and error message', () => request
        .post('/api/articles/345/comments/')
        .send({ user_id: 1, body: 'poo' })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Article_id not found.');
        }));
      it('POST with malformed comment returns 400 and error message', () => request
        .post('/api/articles/1/comments/')
        .send('platypus')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Malformed body, ensure posted data is of correct format.');
        }));
      it('PATCH returns 200 and updates the vote key of the comment', () => request
        .patch('/api/articles/1/comments/1')
        .send({ inc_votes: 100 })
        .then(({ body: { comment } }) => {
          expect(comment.votes).to.equal(200);
        }));
      it('PATCH with malformed body returns 400 and error message', () => request
        .patch('/api/articles/1/comments/1')
        .send({ inc_votes: 'tree' })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. inc_vote should be of type int.');
        }));
      it('PATCH with invalid article_id returns 400 and error message', () => request
        .patch('/api/articles/1/comments/tuna-pasta-bake')
        .send({ inc_votes: 100 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. comment_id  should be int.');
        }));
      it('PATCH with valid but non-existent article_id returns 404 and error message', () => request
        .patch('/api/articles/345')
        .send({ inc_votes: 100 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Article_id not found.');
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
      it('DELETE returns 200 and empty object removing it from db', () => request
        .delete(`${url}/1`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.eql({});
        }));
      it('DELETE with valid but non-existent comment_id returns 404 and error message', () => request
        .delete(`${url}/45423`)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Article_id not found.');
        }));
      it('DELETE with invalid comment_id type returns 400 and error message', () => request
        .delete(`${url}/blap`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. comment_id  should be int.');
        }));
    });
  });

  describe('/users', () => {
    describe('/', () => {
      const url = '/api/users/';
      const userKeys = ['user_id', 'username', 'avatar_url', 'name'];
      it('GET returns 200 and array of user objects', () => request
        .get(url)
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users).to.be.an('array');
          expect(users[0]).to.have.keys(userKeys);
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
    describe('/:username', () => {
      const url = '/api/users/1';
      const userKeys = ['user_id', 'username', 'avatar_url', 'name'];
      it('GET returns 200 and user object', () => request
        .get(url)
        .expect(200)
        .then(({ body }) => {
          expect(body.user).to.not.be.an('array');
          expect(body.user).to.have.keys(userKeys);
        }));
      it('GET with valid but non-existent user_id returns 404 and error message', () => request
        .get('/api/users/99')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('Username not found.');
        }));
      it('GET with invalid user_id returns 400 and error message', () => request
        .get('/api/users/cat_turd')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('Type error. user_id should be int.');
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

// TEST DELETE
// API MAP
// READ ME
