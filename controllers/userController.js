const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer'); // for uploading image functions
const sharp = require('sharp'); // for resizing images

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-76767adba-123918923123.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);

//   }
// });

// kep image as buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')){
    cb(null, true);
  } else {
    cb( new AppError('Not an image! Please upload only images.', 400), false);
  };
};

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  };

  //form file name
  req.file.filename = `user-${req.user.id}-${Date.now()}`;

  // setting the image before saving
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);
  
  next();

});
// ... means $gte 2 variables
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // loop through each value in obj
  Object.keys(obj).forEach(el => {
    // check if that value is allowedFields
    if(allowedFields.includes(el)) {
      // if allowed, then create newObj element.
      newObj[el] = obj[el];
    };
  });
  return newObj;
};


// exports.getAllUsers = catchAsync( async (req,res) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users
//     }
//   });
  
// });

exports.updateMe = catchAsync( async (req, res, next) => {
  // 1) Create error if user POSs password data
  // console.log(req.file);
  // console.log(req.body);
  if (req.body.password || req.body.passwordConfirm){
    return next(new AppError(
      'This route is not for password updates. Please use /updateMyPassword.', 400));
  };
  // 2) Filtering out unwanted fields name that are not allowed to update
  // access to req.user bcs of protect middleware return this
  const filteredBody = filterObj(req.body, 'name', 'email'); // filter req.body and only keep name and email
  if (req.file) {
    filteredBody.photo = req.file.filename;
  };
  // 3) Find and Update that user
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  }); 

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteMe = catchAsync( async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(204).json({
    status: 'success',
    data: null
  });
});


// exports.deleteUser = (req,res) => {
//   res.status(500).json({
//       status: 'error',
//       message: 'This route is not yet defined!'
//   });
// };

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);