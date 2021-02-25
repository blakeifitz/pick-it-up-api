const express = require('express');
const path = require('path');
const categoryService = require('./category-service');
const { requireAuth } = require('../middleware/jwt-auth');
const xss = require('xss');

const categoryRouter = express.Router();
const jsonParser = express.json();

const serializeCategory = (category) => ({
  title: xss(category.title),
  id: category.id,
});

categoryRouter
  .route('/')

  .all(requireAuth)

  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const user_id = req.user.id;

    categoryService
      .getAllCategories(knexInstance, user_id)
      .then((categories) => {
        return res.json(categories.map(serializeCategory));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { title } = req.body;
    const newCategory = { title };

    for (const [key, value] of Object.entries(newCategory))
      if (value == null)
        return res.status(400).json({
          error: { message: `missing '${key}'` },
        });
    newCategory.user_id = req.user.id;
    categoryService
      .addCategory(knexInstance, newCategory)
      .then((category) => {
        res
          .status(201)
          .location(path.join(req.originalUrl, `/${category.name}`))
          .json(serializeCategory(category));
      })
      .catch(next);
  });
categoryRouter

  .route('/:category_title')
  .all(requireAuth)

  .delete((req, res, next) => {
    const user_id = req.user.id;
    categoryService
      .deleteCategory(req.app.get('db'), req.params.category_title, user_id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });
module.exports = categoryRouter;
