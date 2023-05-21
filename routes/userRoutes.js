const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// This part requires authenticated logged in user
router.use(authController.protect); // this middleware will be applied all the code below this line

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', 
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// this part is restricte to Admin only
router.use(authController.restrictTo('admin'));

router
.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);



module.exports = router;
