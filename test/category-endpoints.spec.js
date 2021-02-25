const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Categories Endpoints', function () {
  let db;

  const {
    testUsers,
    testLocations,
    testCategories,
    testItems,
  } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET /api/category`, () => {
    context(`Given no categories`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/category')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () =>
        helpers.seedTables(
          db,
          testUsers,
          testLocations,
          testCategories,
          testItems
        )
      );

      it('responds with 200 and all of the categories', () => {
        const expectedCategory = testCategories.map((category) =>
          helpers.makeExpectedCategory(category)
        );
        return supertest(app)
          .get('/api/category')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [expectedCategory[0]]);
      });
    });

    context(`Given an XSS attack category`, () => {
      const testUser = helpers.makeUsersArray()[0];
      const {
        maliciousCategory,
        expectedCategory,
      } = helpers.makeMaliciousCategory(testUser);

      beforeEach('insert malicious category', () => {
        return helpers.seedMaliciousCategory(db, testUser, maliciousCategory);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/category`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].title).to.eql(expectedCategory.title);
            expect(res.body[0].description).to.eql(
              expectedCategory.description
            );
          });
      });
    });
  });
  describe('POST /category', () => {
    beforeEach(() => helpers.seedUsers(db, testUsers));
    it(`responds with 400 missing  if  anything not supplied`, () => {
      const testUser = helpers.makeUsersArray()[0];
      return supertest(app)
        .post(`/api/category`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400, `{"error":{"message":"missing 'title'"}}`);
    });
    it('adds a new category to the db', () => {
      const testUser = helpers.makeUsersArray()[0];
      const newCategory = {
        title: 'test-title',
      };
      return supertest(app)
        .post(`/api/category`)
        .send(newCategory)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newCategory.title);
        });
    });
  });
  describe(`DELETE /category/:title`, () => {
    beforeEach('insert categories', () =>
      helpers.seedTables(
        db,
        testUsers,
        testLocations,
        testCategories,
        testItems
      )
    );
    context(`Given category that doesn't exist`, () => {
      it(`responds with 404`, () => {
        return supertest(app)
          .delete(`/api/category/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `That category doesn't exist` } });
      });
    });

    context('Given there are articles in the database', () => {
      it('responds with 204', () => {
        return supertest(app)
          .delete(`/api/category/${testCategories[0].title}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204);
      });
    });
  });
});
