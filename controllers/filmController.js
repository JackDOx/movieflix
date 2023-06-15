const Film = require('./../models/filmModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');



// FACTORY version

exports.getAllFilms = factory.getAll(Film);
exports.getFilm = catchAsync(async (req, res, next) => {
  let film = await Film.findOne({slug: req.params.slug});
  if (!film) {
    film = await Film.findById(req.params.slug);
    if (!film) {
    return next(new AppError('No film found', 404));
    };
  };

  film.populate({ path: 'reviews' });

  res.status(200).json({
    status: 'success',
    data: film
  });
});
exports.createFilm = factory.createOne(Film);
exports.updateFilm = factory.updateOne(Film);
exports.deleteFilm = factory.deleteOne(Film);

// Return the query that search for the genres of film
exports.aliasFilm = catchAsync(async (req,res,next) => {
  req.query = {
    genres : { $in: [req.query.genres]},
    sort: '-date'
  }
  next();
});

// Search engine version v0.1 by Jack Do
// Search return the query that match if the query is found in name, directors or actors field
exports.searchFilm = catchAsync(async (req, res, next) => {
  req.query.sort = '-date';

  const searchString = req.query.search; // Assuming the search string is provided in the 'search' query parameter

  if (searchString) {
    req.query.$or = [
      { name: { $regex: searchString, $options: 'i' } }, // Search film name (case-insensitive)
      { director: {  $regex: searchString, $options: 'i' } }, // Search director names (case-insensitive)
      { actors: { $elemMatch: { $regex: searchString, $options: 'i' } } } // Search actor names in arrat of actors (case-insensitive)
    ];
  }

  delete req.query.search; // Remove the 'search' query parameter from the query object

  next();
});
