const ItemService = {
  getAllItems(knex, user_id) {
    return knex.from('items').where({ user_id }).select('*');
  },
};

module.exports = ItemService;
