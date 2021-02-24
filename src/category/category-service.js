const categoryService = {
  getAllCategories(knex, user_id) {
    return knex.from('categories').select('*').where({ user_id });
  },
};
module.exports = categoryService;
