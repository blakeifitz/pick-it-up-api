const express = require('express');
const LocationService = require('./location-service');
const { requireAuth } = require('../middleware/jwt-auth');
const xss = require('xss');

const locationRouter = express.Router();
const jsonParser = express.json();

const serializeLocation = (location) => ({
  name: xss(location.name),
  description: xss(location.description),
  id: location.id,
  coordinates: location.coordinates,
});

locationRouter
  .route('/')

  .all(requireAuth)

  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user_id = req.user.id;

    LocationService.getAllLocations(knexInstance, user_id)
      .then((locations) => {
        return res.json(locations.map(serializeLocation));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name, description, coordinates } = req.body;
    const newLocation = { name, description, coordinates };
    for (const [key, value] of Object.entries(newLocation))
      if (value == null)
        return res.status(400).json({
          error: { message: `missing '${key}'` },
        });
    newLocation.user_id = req.user.id;

    LocationService.addLocation(knexInstance, newLocation)
      .then((location) => {
        res.status(201).json(serializeLocation(location));
      })
      .catch(next);
  });
locationRouter
  .route('/:location_id')
  .all(requireAuth)
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user_id = req.user.id;
    LocationService.getById(knexInstance, req.params.location_id, user_id)
      .then((location) => {
        if (!location) {
          return res.status(404).json({
            error: {
              message: `That location doesn't exist`,
            },
          });
        }
        res.location = location;
        next();
      })
      .catch(next);
  })

  .delete((req, res, next) => {
    const user_id = req.user.id;
    LocationService.deleteLocation(
      req.app.get('db'),
      req.params.location_id,
      user_id
    )
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });
module.exports = locationRouter;
