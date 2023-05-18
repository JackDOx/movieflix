const AppError = require('./../utils/appError');

module.exports = (err, req, res, next) => {
  // console.log(err.stack); // err.stack shows where the error happen

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'development'){
    if (req.originalUrl.startsWith('/api')){
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
  } else {
    // RENDERED ERROR WEBSITE
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  
  } else //if(process.env.NODE_ENV === 'production ')
    {
      if (req.originalUrl.startsWith('/api')){
        if(err.name === 'CastError') {
          err = new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
        };

        if(err.code === 11000) {
          const value = err.message.match(/(['' '])(\\?.)*?\1/)[0];
          err = new AppError(`Duplicate field value: ${value}. Please use another value!`,400)
        };

        if(err.name === 'ValidationError'){
          const errors = Object.values(err.errors).map(el => el.message);
          err = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
        };

        if (err.name === 'JsonWebTokenError') {
          err = new AppError('Invalid Token, please login again', 401);
        };

        if (err.name === 'TokenExpiredError'){
          err = new AppError('Your token has expired!, please log in again', 401);
        };

        if(err.isOperational){
          res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          });
        } else { // programming error
          res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
          });
        };
    } else {
      // RENDER ERROR PAGE
      const errOptions = { title: 'Something went wrong!'};
      if (err.isOperational) {
        errOptions.msg = err.message;
      };
      res.status(err.statusCode).render('error', errOptions);
    };
  };
};