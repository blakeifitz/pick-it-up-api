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
  describe('POST /location', () => {
    beforeEach(() => helpers.seedUsers(db, testUsers));
    it(`responds with 400 missing if anything not supplied`, () => {
      const testUser = helpers.makeUsersArray()[0];
      return supertest(app)
        .post(`/api/location`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400, `{"error":{"message":"missing 'name'"}}`);
    });
    it('adds a new location to the store', () => {
      const testUser = helpers.makeUsersArray()[0];
      const newLocation = {
        coordinates: '(36.1564, -84.1284)',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
        id: 1,
        name: 'First test!',
        user_id: 1,
      };
      return supertest(app)
        .post(`/api/location`)
        .send(newLocation)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newLocation.title);
        });
    });
  });
});
