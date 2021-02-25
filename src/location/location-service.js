const LocationService = {
  getAllLocations(knex, user_id) {
    return knex.from('locations').select('*').where({ user_id });
  },
  addLocation(knex, newLocation) {
    return knex
      .insert(newLocation)
      .into('locations')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  getById(knex, id, user_id) {
    return knex
      .from('locations')
      .where({ id: id, user_id: user_id })
      .select('*')
      .first();
  },

  deleteLocation(knex, id, user_id) {
    return knex('locations').where({ id: id, user_id: user_id }).delete();
  },
};
module.exports = LocationService;
