const express = require('express');
const videoController = require('./../controllers/videoController');
const router = express.Router();

router
.route('/:id')
  .get(videoController.pipeVideo);

module.exports = router;