const crypto = require('crypto');
const { promisify } = require('util'); // module to promisify the function
// ES6 destructuring 0 only take promisify from util
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils//catchAsync');
const AppError = require('./../utils/appError');

const Email = require('./../utils/email');

const signToken = id => {

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  }); // jwt format works with date like 60d
};

const createSendToken = (user, statusCode, res) =>{
  const token = signToken(user._id); // id in mongodb is _id
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
    httpOnly: true, // httpOnly is cookie only be recieved and sent not be read
    secure: false
  };

  // use SET will make production has a white space after it
  // if(process.env.NODE_ENV === 'production ') {
  //   cookieOptions.secure = true;  // secure will make the cookie can't be read
  // };
  if(process.env.NODE_ENV != 'development') {
    cookieOptions.secure = true;  // secure will make the cookie can't be read
  };

  res.cookie('jwt', token, cookieOptions);
    
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();
  // 201- created statusCode
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email , password } = req.body; // take email = req.body.email
  
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  };
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if(!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); // 401 - unauthorized
  };

  // +password means select password field in database
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);

});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10*1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (req.headers.authorization && 
  req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];

  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  };

  if(!token){
    return next(new AppError('You are not logged in! Please log in to get access', 401));
  };
  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); 

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next( new AppError('The user belonging to this token no longer exists'),401);
  };
  // 4) Check if user changed password after the token was issued
  if(freshUser.changedPasswordAfter(decoded.iat)){
    return next(new AppError('User recently changed password! Pleas log in again', 401));
  };


  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  //geting the token from cookies
  if (req.cookies.jwt) {
    try {
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt , process.env.JWT_SECRET); 

    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    };
    // 3) Check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
      return next();
    };

    // THERE IF A LOGGED IN USER
    res.locals.user = currentUser;
    return next();
    } catch (err) {
      return next();
    };
};
  next();
});

// Middleware with parameters
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if(!roles.includes(req.user.role)){ //req.user was saved by protect
      return next(new AppError('You do not have permission to perform this action', 403));
    };  // 403 is permission denied
  
    next();
  };
};

// forgotPasswordHandler

exports.forgotPassword = catchAsync(async (req,res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if(!user) {
    return next(new AppError('There is no user with that email address', 404));
  };
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false}); // deactivate the validator
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit PATCH request with your new password and passwordConfirm to: ${resetURL}
  \n If you didn't forget your password, please ignore this email!`;

  try {

    await new Email(user, resetURL).sendPasswordReset();

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  };

});

exports.resetPassword = catchAsync(async (req, res, next) => {

  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256')
  .update(req.params.token) // encrypt this data
  .digest('hex'); // digest is convert to hexa

  const user = await User.findOne(
    {
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now()}
    });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) update changedPasswordAt property for current user

  // 4) Log the user in, send JWT 
  createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync(async (req, res, next) => {
  
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Your current password is incorrect.', 401));
  };
  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIdAndUpdate does not work bcs middleware and validator only run on save()
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});