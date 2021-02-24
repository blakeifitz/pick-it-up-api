const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Items Endpoints', function () {
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

  describe(`GET /api/item`, () => {
    context(`Given no items`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/item')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given there are items in the database', () => {
      beforeEach('insert items', () =>
        helpers.seedTables(
          db,
          testUsers,
          testLocations,
          testCategories,
          testItems
        )
      );

      it('responds with 200 and all of the items', () => {
        const expectedItem = testItems.map((item) =>
          helpers.makeExpectedItem(item)
        );
        return supertest(app)
          .get('/api/item')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [expectedItem[0]]);
      });
    });

    context(`Given an XSS attack item`, () => {
      const testUser = helpers.makeUsersArray()[0];
      const { maliciousItem, expectedItem } = helpers.makeMaliciousItem(
        testUser
      );

      beforeEach('insert malicious item', () => {
        return helpers.seedMaliciousItem(
          db,
          testUser,
          testLocations,
          testCategories,
          maliciousItem
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/item`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].keyword).to.eql(expectedItem.keyword);
            expect(res.body[0].definition).to.eql(expectedItem.definition);
          });
      });
    });
  });
});
