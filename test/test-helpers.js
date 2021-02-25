const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const itemRouter = require('../src/item/item-router');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      full_name: 'Test user 1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      full_name: 'Test user 2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      full_name: 'Test user 3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      full_name: 'Test user 4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeLocationsArray() {
  return [
    {
      coordinates: '(36.1564, -84.1284)',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      id: 1,
      name: 'First test!',
      user_id: 1,
    },
    {
      coordinates: '(36.1564, -84.1284)',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      id: 2,
      name: 'Second test location!',
      user_id: 2,
    },
    {
      coordinates: '(36.1564, -84.1284)',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      id: 3,
      name: 'Third test location!',
      user_id: 3,
    },
    {
      coordinates: '(36.1564, -84.1284)',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      id: 4,
      name: 'Fourth test location!',
      user_id: 3,
    },
  ];
}

function makeCategoriesArray() {
  return [
    {
      id: 1,
      title: 'First test category',
      user_id: 1,
    },
    {
      id: 2,
      title: 'Second test category',
      user_id: 2,
    },
    {
      id: 3,
      title: 'Third test category',
      user_id: 3,
    },
    {
      id: 4,
      title: 'Fourth test category',
      user_id: 3,
    },
  ];
}

function makeItemsArray() {
  return [
    {
      id: 1,
      name: 'First test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      category: 'Second test category',
      location: 1,
      user_id: 1,
    },
    {
      id: 2,
      name: 'Second test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      location: 3,
      category: 'Second test category',
      user_id: 2,
    },
    {
      id: 3,
      name: 'Third test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      location: 3,
      category: 'Second test category',
      user_id: 3,
    },
    {
      id: 4,
      name: 'Fourth test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      category: 'First test category',
      location: 4,
      user_id: 3,
    },
    {
      id: 5,
      name: 'Fifth test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      category: 'Third test category',
      location: 3,
      user_id: 4,
    },
    {
      id: 6,
      name: 'Sixth test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      category: 'First test category',
      location: 3,
      user_id: 4,
    },
    {
      id: 7,
      name: 'Seventh test item!',
      img_src: 'img src',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      category: 'First test category',
      location: 2,
      user_id: 2,
    },
  ];
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
          items,
          categories,
          locations,
          users
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE locations_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE items_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE categories_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('locations_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
          trx.raw(`SELECT setval('categories_id_seq', 0)`),
          trx.raw(`SELECT setval('items_id_seq', 0)`),
        ])
      )
  );
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testLocations = makeLocationsArray();
  const testCategories = makeCategoriesArray();
  const testItems = makeItemsArray();
  return { testUsers, testLocations, testCategories, testItems };
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

function seedTables(db, users, locations, categories, items = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await trx.into('users').insert(users);
    await trx.into('locations').insert(locations);
    await trx.into('categories').insert(categories);
    // update the auto sequence to match the forced id values
    await Promise.all([
      trx.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id]),
      trx.raw(`SELECT setval('locations_id_seq', ?)`, [
        locations[locations.length - 1].id,
      ]),
      trx.raw(`SELECT setval('categories_id_seq', ?)`, [
        categories[categories.length - 1].id,
      ]),
    ]);
    // only insert items if there are some, also update the sequence counter
    if (items.length) {
      await trx.into('items').insert(items);
      await trx.raw(`SELECT setval('items_id_seq', ?)`, [
        items[items.length - 1].id,
      ]);
    }
  });
}

function makeExpectedLocation(location) {
  return {
    coordinates: { x: 36.1564, y: -84.1284 },
    name: location.name,
    description: location.description,
    id: location.id,
  };
}

function makeMaliciousLocation(user) {
  const maliciousLocation = {
    id: 911,
    coordinates: '(36.1564, -84.1284)',
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedLocation = {
    ...makeExpectedLocation([user], maliciousLocation),
    name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousLocation,
    expectedLocation,
  };
}

function seedMaliciousLocation(db, user, location) {
  return db
    .into('users')
    .insert([user])
    .then(() => db.into('locations').insert([location]));
}

function makeExpectedCategory(category) {
  return {
    title: category.title,
    id: category.id,
  };
}

function makeMaliciousCategory(user) {
  const maliciousCategory = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
  };
  const expectedCategory = {
    ...makeExpectedCategory([user], maliciousCategory),
    title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
  };
  return {
    maliciousCategory,
    expectedCategory,
  };
}

function seedMaliciousCategory(db, user, category) {
  return db
    .into('users')
    .insert([user])
    .then(() => db.into('categories').insert([category]));
}

function makeExpectedItem(item) {
  return {
    name: item.name,
    id: item.id,
    description: item.description,
    img_src: item.img_src,
    category: item.category,
    location: item.location,
  };
}

function makeMaliciousItem(user) {
  const maliciousItem = {
    id: 911,
    location: 1,
    category: 'First test category',
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    img_src: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    description: 'This is a description',
  };
  const expectedItem = {
    ...makeExpectedItem([user], maliciousItem),
    name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    img_src: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousItem,
    expectedItem,
  };
}

function seedMaliciousItem(
  db,
  testUser,
  testLocations,
  testCategories,
  maliciousItem
) {
  const testLocation = testLocations[0];
  const testCategory = testCategories[0];
  return db
    .into('users')
    .insert([testUser])
    .then(() => db.into('locations').insert([testLocation]))
    .then(() => db.into('categories').insert([testCategory]))
    .then(() => db.into('items').insert(maliciousItem));
}

module.exports = {
  makeFixtures,
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedTables,
  makeExpectedLocation,
  makeMaliciousLocation,
  makeUsersArray,
  seedMaliciousLocation,
  makeExpectedCategory,
  makeMaliciousCategory,
  seedMaliciousCategory,
  makeExpectedItem,
  makeMaliciousItem,
  seedMaliciousItem,
};
