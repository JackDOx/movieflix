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
  
  const filterBody = {film: req.body.film};
  const doc = await Save.findOneAndUpdate({ user: req.body.user }, filterBody, {
    new: true,
    runValidators: true
  });
  if (!doc) {
    return next(new AppError('Can\'t update Save List', 404));
  };
  res.status(200).json({
      status: 'success',
      doc
  });
}
);

exports.getMySave = catchAsync(async (req, res, next) => {
  const doc = await Save.findOne({ user: req.body.user });
  if (!doc) {
    return next(new AppError('Can\'t find that Save List/ Something went wrong', 404));
  };
  res.status(200).json({
    status: 'success',
    doc
  });
});

exports.deleteSave = factory.deleteOne(Save);