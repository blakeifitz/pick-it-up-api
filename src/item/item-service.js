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
  getById(knex, id, user_id) {
    return knex
      .from('items')
      .where({ id: id, user_id: user_id })
      .select('*')
      .first();
  },

  deleteItem(knex, id, user_id) {
    return knex('items').where({ id: id, user_id: user_id }).delete();
  },
  updateItem(knex, id, updatedFields, user_id) {
    return knex
      .from('items')
      .where({ id: id, user_id: user_id })
      .update(updatedFields);
  },
};

module.exports = ItemService;
