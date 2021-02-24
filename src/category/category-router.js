const express = require('express');
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
  });
module.exports = categoryRouter;
