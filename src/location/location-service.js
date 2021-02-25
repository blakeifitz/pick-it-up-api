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
};
module.exports = LocationService;
