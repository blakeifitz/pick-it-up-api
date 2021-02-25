const ItemService = {
  getAllItems(knex, user_id) {
    return knex.from('items').where({ user_id }).select('*');
  },
  addItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('items')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = ItemService;
