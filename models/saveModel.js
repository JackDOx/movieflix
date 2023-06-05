const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({

  film: {
    type: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Film'
    }],
    validate: {
      validator: function(arr) {
        const uniqueIds = new Set(arr.map(String)); // Convert each ObjectId to a string and create a Set
        return uniqueIds.size === arr.length; // Check if the size of uniqueIds is the same as the array length
      },
      message: 'Each film ID must be unique within the array.'
    }
  },
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

saveSchema.index({ user: 1});

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