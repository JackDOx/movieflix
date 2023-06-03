const express = require('express');
const saveController = require('./../controllers/saveController');
const authController = require('./../controllers/authController');


const router = express.Router();

// Require login to work with reviews
router.use(authController.protect);

router.route('/')
  .get( authController.restrictTo('admin', 'associate'), saveController.getAllSaves)
  .post( 
    authController.restrictTo('admin', 'associate'),
    saveController.createSave);

router.route('/:id')
    .get(saveController.setUserId, saveController.getSave)
    .delete(authController.restrictTo('admin', 'associate'), saveController.deleteSave)
    .patch(saveController.setUserId, saveController.updateSave);

  
module.exports = router;
