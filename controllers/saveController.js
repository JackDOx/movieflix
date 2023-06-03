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

exports.getAllSaves = catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (popOptions) {
    query = query.populate(popOptions); // populating the id with actual data
  };

  const doc = await query;   

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  };
  res.status(200).json({
    status: 'success',
    data: doc
  })
});


exports.getSave = factory.getOne(Save);
exports.createSave = factory.createOne(Save);
exports.updateSave = catchAsync(async (req, res, next) => {

  const rev = await Save.findById(req.params.id);

  // req.body.user: current user | rev.user: owner of the Save
  if(!rev || (req.body.user != rev.user.id)) {
    return next(new AppError('No document found with that ID/ You dont own this Save List', 404));
  };

  const doc = await Save.findByIdAndUpdate(req.params.id, req.body, {
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

exports.deleteSave = catchAsync(async (req, res, next) => {
  
  const doc = await Save.findByIdAndDelete(req.params.id);
  // req.body.user: current user | rev.user: owner of the Save
  if(!doc) {
    return next(new AppError('No document found with that ID', 404));
  };



  res.status(204).json({ // 204 means no content
    status: 'success',
    data: null
    });
   
});