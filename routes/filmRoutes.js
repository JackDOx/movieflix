const express = require('express');
const filmController = require('./../controllers/filmController');
const authController = require('./../controllers/authController');
const reviewRoutes  = require('./reviewRoutes');
const router = express.Router();


router
.route('/')
  .get(filmController.getAllFilms)
  .post(authController.protect, authController.restrictTo('admin','associate'), filmController.createFilm);

router
.route('/:id')
  .get(filmController.getFilm)
  .patch(authController.protect,
    authController.restrictTo('admin'),
    filmController.updateFilm)
  .delete(authController.protect,
    authController.restrictTo('admin'),
    filmController.deleteFilm);

router
.route('/film-category/:category')
    .get(filmController.aliasFilm, filmController.getAllFilms);


// mounting to reviewRoutes as working with reviews
router.use('/:filmId/reviews', reviewRoutes); // it matches the '/' route

module.exports = router;