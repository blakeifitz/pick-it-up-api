const categoryService = {
  getAllCategories(knex, user_id) {
    return knex.from('categories').select('*').where({ user_id });
  },
  addCategory(knex, newCategory) {
    return knex
      .insert(newCategory)
      .into('categories')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getByTitle(knex, title, user_id) {
    return knex
      .from('categories')
      .where({ title: title, user_id: user_id })
      .select('*')
      .first();
  },

  deleteCategory(knex, title, user_id) {
    return knex('categories')
      .where({ title: title, user_id: user_id })
      .delete();
  },
};
module.exports = categoryService;
