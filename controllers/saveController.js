const Save = require('./../models/saveModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');



exports.setUserId = (req, res, next) => {
  if(!req.body.user) {
    req.body.user = req.user.id; // req.user comes from protect middleware
  };
  next();
};

exports.getAllSaves = factory.getAll(Save);
exports.getSave = factory.getOne(Save);
exports.createSave = factory.createOne(Save);
exports.updateSave = factory.updateOne(Save);

exports.updateMySave = catchAsync(async (req, res, next) => {
  
  const filterBody = req.body.film;
  // const doc = await Save.findOneAndUpdate({ user: req.body.user }, filterBody, {
  //   new: true,
  //   runValidators: true
  // });
  let doc = await Save.findOne({ user: req.body.user });

  if (!doc) {
    doc = await Save.create({ user: req.body.user, film: [filterBody] });
  } else {
    doc.film = doc.film.concat([filterBody]);
    doc = await doc.save();
  };

  res.status(200).json({
      status: 'success',
      doc
  });
});

exports.deleteMySave = catchAsync(async (req, res, next) => {
  const filterBody = req.body.film;
  console.log(filterBody);
  let doc = await Save.findOne({ user : req.body.user});

  if (!doc) {
    return next(new AppError('No Save List found existing with this use, try to save a film first', 404));
  } else {
    // Filter out the film that has the same value as the request
    doc.film = doc.film.filter(f => f != String(filterBody));
    doc = await doc.save();
  };

  res.status(200).json({
    status: 'success',
    doc
  });
});

exports.getMySave = catchAsync(async (req, res, next) => {
  let doc = await Save.findOne({ user: req.body.user }).populate('film');
  if (!doc) {
    doc = await Save.create({ user: req.body.user, film: []});
  };
  res.status(200).json({
    status: 'success',
    doc
  });
});

exports.deleteSave = factory.deleteOne(Save);