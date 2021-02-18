const LocationService = {
  getAllLocations(knex, user_id) {
    return knex.from('locations').select('*').where({ user_id });
  },
};
module.exports = LocationService;
