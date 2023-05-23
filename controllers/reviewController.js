const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

// exports.getAllReviews = catchAsync( async (req, res, next) => {
//   let filter = {};
//   if(req.params.tourId) {
//     filter = {tour: req.params.tourId};
//   };
//   const reviews = await Review.find(filter);

//     res.status(200).json({
//       status: 'success',
//       results: reviews.length,
//       data: {
//         reviews
//       }
//     });
// });

exports.setFilmUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.film) {
      req.body.film = req.params.filmId;
    };
    if(!req.body.user) {
      req.body.user = req.user.id; // req.user comes from protect middleware
    };
    next();
}

// exports.createReview = catchAsync( async (req, res, next) => {


//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview
//     }
//   });
// });

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = catchAsync(async (req, res, next) => {

  const rev = await Review.findById(req.params.id);

  // req.body.user: current user | rev.user: owner of the review
  if(!rev || (req.body.user != rev.user.id)) {
    return next(new AppError('No document found with that ID/ You dont own this review', 404));
  };

  const doc = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });



  res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }       
  });
}
);
exports.deleteReview = catchAsync(async (req, res, next) => {
  
  const rev = await Review.findById(req.params.id);

  // req.body.user: current user | rev.user: owner of the review
  if(!rev || (req.body.user != rev.user.id)) {
    return next(new AppError('No document found with that ID', 404));
  };

  const doc = await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({ // 204 means no content
    status: 'success',
    data: null
    });
   
});