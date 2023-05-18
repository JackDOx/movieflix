const Film = require('./../models/filmModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');



// FACTORY version

exports.getAllFilms = factory.getAll(Film);
exports.getFilm = factory.getOne(Film);
exports.createFilm = factory.createOne(Film);
exports.updateFilm = factory.updateOne(Film);
exports.deleteFilm = factory.deleteOne(Film);

exports.aliasFilm = catchAsync(async (req,res,next) => {
  
});