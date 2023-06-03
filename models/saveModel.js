const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({

  film: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Film'
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Review must belong to a user.']
  }

},
{
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
}
);


// MIDDLEWARE
saveSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  });

  next();
});
const Save = mongoose.model('Save', saveSchema);

module.exports = Save;