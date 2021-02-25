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
  describe('POST /item', () => {
    beforeEach('insert items', () =>
      helpers.seedTables(db, testUsers, testLocations, testCategories)
    );
    it(`responds with 400 missing anything if not supplied`, () => {
      const testUser = helpers.makeUsersArray()[0];
      return supertest(app)
        .post(`/api/item`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400, `{"error":{"message":"missing 'location'"}}`);
    });
    it('adds a new item to the store', () => {
      const testUser = helpers.makeUsersArray()[0];
      const newItem = {
        name: 'First test item!',
        img_src: 'img src',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        category: 'Second test category',
        location: 1,
      };
      return supertest(app)
        .post(`/api/item`)
        .send(newItem)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newItem.name);
        });
    });
  });
  describe(`DELETE /item/:id`, () => {
    beforeEach('insert items', () =>
      helpers.seedTables(
        db,
        testUsers,
        testLocations,
        testCategories,
        testItems
      )
    );
    context(`Given item that doesn't exist`, () => {
      it(`responds with 404`, () => {
        return supertest(app)
          .delete(`/api/item/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `That item doesn't exist` } });
      });
    });

    context('Given there are items in the database', () => {
      it('responds with 204', () => {
        return supertest(app)
          .delete(`/api/item/${testItems[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204);
      });
    });
  });
  describe(`PATCH /api/items/:item_id`, () => {
    beforeEach('insert items', () =>
      helpers.seedTables(
        db,
        testUsers,
        testLocations,
        testCategories,
        testItems
      )
    );
    context(`Given item that doesn't exist`, () => {
      it(`responds with 404`, () => {
        return supertest(app)
          .patch(`/api/item/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `That item doesn't exist` } });
      });
    });
    context('Given there are items in the database', () => {
      it('responds with 204 and updates the item', () => {
        const updateItem = {
          name: 'updated item name',
          description: 'Interview',
        };
        return supertest(app)
          .patch(`/api/item/${testItems[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updateItem)
          .expect(204);
      });

      it(`responds with 400 when no required fields supplied`, () => {
        return supertest(app)
          .patch(`/api/item/${testItems[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must content either 'name', or 'description'.`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const updateItem = {
          name: 'updated item name',
        };
        return supertest(app)
          .patch(`/api/item/${testItems[0].id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send({
            ...updateItem,
            fieldToIgnore: 'should not be in GET response',
          })
          .expect(204);
      });
    });
  });
});
