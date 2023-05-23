const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// Merge the parameeters from other routes that is mounted to this route
const router = express.Router({ mergeParams: true });

// POST /tours/1208adsh1/reviews = POST /reviews
// GET /tour/102938102/ reviews
// POST /reviews

// Require login to work with reviews
router.use(authController.protect);

router.route('/')
  .get( reviewController.getAllReviews)
  .post( 
    authController.restrictTo('admin', 'associate', 'user'),
    reviewController.setFilmUserIds,
    reviewController.createReview);

router.route('/:id')
    .get( reviewController.getReview)
    .delete(authController.restrictTo('admin', 'associate', 'user'),  reviewController.setFilmUserIds, reviewController.deleteReview)
    .patch(authController.restrictTo('admin', 'associate', 'user'), reviewController.setFilmUserIds, reviewController.updateReview);

  
module.exports = router;
