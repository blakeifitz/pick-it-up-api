const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Locations Endpoints', function () {
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

  describe(`GET /api/location`, () => {
    context(`Given no locations`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/location')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given there are locations in the database', () => {
      beforeEach('insert locations', () =>
        helpers.seedTables(
          db,
          testUsers,
          testLocations,
          testCategories,
          testItems
        )
      );

      it('responds with 200 and all of the Locations', () => {
        const expectedLocation = testLocations.map((location) =>
          helpers.makeExpectedLocation(location)
        );
        return supertest(app)
          .get('/api/location')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [expectedLocation[0]]);
      });
    });

    context(`Given an XSS attack location`, () => {
      const testUser = helpers.makeUsersArray()[0];
      const {
        maliciousLocation,
        expectedLocation,
      } = helpers.makeMaliciousLocation(testUser);

      beforeEach('insert malicious location', () => {
        return helpers.seedMaliciousLocation(db, testUser, maliciousLocation);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/location`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].name).to.eql(expectedLocation.name);
            expect(res.body[0].description).to.eql(
              expectedLocation.description
            );
          });
      });
    });
  });
});
