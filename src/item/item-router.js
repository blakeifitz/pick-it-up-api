const express = require('express');
const ItemService = require('./item-service');
const { requireAuth } = require('../middleware/jwt-auth');
const xss = require('xss');
const path = require('path');

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
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { location, name, img_src, description, category } = req.body;
    const newItem = { location, name, img_src, description, category };

    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: { message: `missing '${key}'` },
        });

    newItem.user_id = req.user.id;

    ItemService.addItem(knexInstance, newItem)
      .then((item) => {
        res
          .status(201)
          .location(path.join(req.originalUrl, `/${item.name}`))
          .json(serializeItems(item));
      })
      .catch(next);
  });
module.exports = itemRouter;
