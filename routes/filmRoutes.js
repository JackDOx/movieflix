const express = require('express');
const filmController = require('./../controllers/filmController');
const authController = require('./../controllers/authController');

const router = express.Router();


router
.route('/')
  .get(filmController.getAllFilms)
  .post(authController.protect, authController.restrictTo('admin','associate'), filmController.createFilm);

router
.route('/:id')
  .get(filmController.getFilm)
  .patch(authController.protect,
    authController.restrictTo('admin', 'associate'),
    filmController.updateFilm)
  .delete(authController.protect,
    authController.restrictTo('admin', 'associate'),
    filmController.deleteFilm);

router
.route('/film-category/:category')
    .get(filmController.aliasFilm, filmController.getAllFilms);



module.exports = router;