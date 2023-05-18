const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// take in Model and return the function
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document with that id found!'), 404);
  };
  res.status(204).json({ // 204 means no content
    status: 'success',
    data: null
    });
   
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if(!doc) {
    return next(new AppError('No document found with that ID', 404));
  };

  res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }       
  });
}
);

exports.createOne = Model => catchAsync(async (req,res, next) => {
  // const newTour = new Tour({});
  // newTour.save();
  const doc = await Model.create(req.body);


    res.status(201).json({
      status : 'success',
      data: {
          data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
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
    data: {
      data: doc
    }
  })
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
  // console.log(req.requestTime);
  // EXECUTE QUERY
  let filter = {};
  if(req.params.tourId) {
    filter = {tour: req.params.tourId};
  };
  const features = new APIFeatures(Model.find(filter), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();

  const doc = await features.query; // await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: {
        data: doc
    }
});

});
