const catchAsync = require('./catchAsync');
const AppError = require('./appError');

module.exports = catchAsync( async (req,res,next) => {
  if (process.env.NODE_ENV == 'production' && req.headers.origin != process.env.FRONT_END_DOMAIN) {
    next(new AppError('Prohibited', 401));
  };

  next();
});