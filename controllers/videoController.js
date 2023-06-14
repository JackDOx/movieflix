const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Film = require('./../models/filmModel');
const request = require('request');

exports.pipeVideo = catchAsync(async (req, res, next) => {
  if (req.get('Host') !== process.env.FRONT_END_PROTOCOL_TEST) {
    return next(new AppError('Prohibited! you can not access the video this way', 401));
  };

  // Find the film data with the id, select the link field and extract link only
  const videoUrl = (await Film.findById(req.params.id).select('+link')).link;

  if (!videoUrl) {
    return next(new AppError('Video not found',404));
  };

  //Write head
  res.set('Content-Type', 'video/mp4');
  res.set('Content-Disposition', 'attachment; filename="video.mp4"');
  // Proxy the video request to OneDrive
  req.pipe(request(videoUrl)).pipe(res);
});
