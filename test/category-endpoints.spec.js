const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Categories Endpoints', function () {
  let db;

  const { testUsers, testCategories } = helpers.makeCategoriesFixtures();

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
        helpers.seedCategoriesTables(db, testUsers, testCategories)
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
      const { maliciousDeck, expectedCategory } = helpers.makeMaliciousDeck(
        testUser
      );

      beforeEach('insert malicious deck', () => {
        return helpers.seedMaliciousDeck(db, testUser, maliciousDeck);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/category`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].name).to.eql(expectedCategory.name);
            expect(res.body[0].description).to.eql(
              expectedCategory.description
            );
          });
      });
    });
  });

  describe(`GET /api/category/:deck_id`, () => {
    context(`Given no categories`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const deckId = 123456;
        return supertest(app)
          .get(`/api/category/${deckId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: {
              message: `That deck doesn't exist`,
            },
          });
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert categories', () =>
        helpers.seedCategoriesTables(db, testUsers, testCategories, testCards)
      );

      it('responds with 200 and the specified deck', () => {
        const deckId = 2;
        const expectedCategory = helpers.makeExpectedCategory(
          testCategories[deckId - 1]
        );

        return supertest(app)
          .get(`/api/category/${deckId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedCategory);
      });
    });

    context(`Given an XSS attack deck`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const { maliciousDeck, expectedCategory } = helpers.makeMaliciousDeck(
        testUser
      );

      beforeEach('insert malicious deck', () => {
        return helpers.seedMaliciousDeck(db, testUser, maliciousDeck);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/category/${maliciousDeck.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect((res) => {
            expect(res.body.title).to.eql(expectedCategory.title);
            expect(res.body.content).to.eql(expectedCategory.content);
          });
      });
    });
  });
});
