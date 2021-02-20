const express = require('express');
const ItemService = require('./item-service');
const { requireAuth } = require('../middleware/jwt-auth');
const xss = require('xss')

const itemRouter = express.Router();
const jsonParser = express.json();

const serializeItems = (item) => ({
  name: xss(item.name),
  description: xss(item.description),
  id: item.id,
  img_src: item.img_src,
  category: item.category,
  location: item.location,
});

itemRouter
  .route('/')

  .all(requireAuth)

  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user_id = req.user.id;
    ItemService.getAllItems(knexInstance, user_id)
      .then((items) => {
        return res.json(items.map(serializeItems));
      })
      .catch(next);
  });
module.exports = itemRouter;
