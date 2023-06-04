const express = require('express');
const saveController = require('./../controllers/saveController');
const authController = require('./../controllers/authController');


const router = express.Router();

// Require login to work with reviews
router.use(authController.protect);

// User interations with Save List
router.route('/mySave')
  .get(saveController.setUserId, saveController.getMySave)
  .patch(saveController.setUserId, saveController.updateMySave);

// For Admin only
router.use(authController.restrictTo('admin', 'associate'));
router.route('/')
  .get( saveController.getAllSaves)
  .post( saveController.createSave);

router.route('/:id')
    .get(saveController.getSave)
    .delete( saveController.deleteSave)
    .patch( saveController.updateSave);

  
module.exports = router;
