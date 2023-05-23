const mongoose = require('mongoose');
const Film = require('./filmModel');
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty!']
  },
  rating: {
    type: Number,
    required: [true, 'A rating is required for a review'],
    min: [1, 'Rating must be above 1.0.'],
    max: [5, 'Rating must be below 5.0.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  film: {
    type: mongoose.Schema.ObjectId,
    ref: 'Film',
    required: [true, 'Review must belong to a film.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Review must belong to a user.']
  }

},
{
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
}
);

reviewSchema.index({ film: 1, user: 1 }, { unique: true });


// MIDDLEWARE
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});


// Calculating statistics for a film after post a new Review for it
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // This point to model so we can use aggregate()
  const stats = await this.aggregate([
    {
      $match: { film: tourId }  // match the Reviews with film = tourId
    },
    {
      $group: {
        _id: '$film',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  // if there is only 1 review references to the tour, delete it means can't find
  // any reviews with that tourId so stats will be empty. In taht case, we set it to default.
  if (stats.length >0){
    await Film.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Film.findByIdAndUpdate(tourId,{
      ratingQuantity: 0,
      ratingsAverage: 4.5
  });
  };
};

// post save does not access the next middleware
reviewSchema.post('save', function() {
  // this points to current review
  // this.constructor is Film
  this.constructor.calcAverageRatings(this.film);

});

// findByIdAndUpdate
// findByIdAndDelete  are findOneAnd... in the background
// middleware with find doesnot access the document but the query
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // query is not executed so this.findOne() returns a Review
  this.r = await this.findOne();  // save the current Review to this.r
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.film);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;