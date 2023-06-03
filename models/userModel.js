const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name']
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    role: {
      type: String,
      enum: ['admin', 'associate', 'user'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm:{
      type: String,
      required: [true, 'Please confirm your password'],   
      validate: {
        validator: function(el){  
          // custom validation only works on SAVE() or CREATE()
          return el === this.password; // this refers to this model object
        },
        message: 'Passwords are not the same' // run on fail validator
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true
    },
    premium: {
      type: Boolean,
      default: false
    },
    premiumExpires: {
      type: Date,
      default: Date.now() -10*60*1000
    }
  
  });
  

userSchema.virtual('saves', {
  ref: 'Save',
  localField: '_id',
  foreignField: 'user'
});
  

// MIDDLEWARE

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) {
    return next(); // check if user modified the password
  };
  this.password = await bcrypt.hash(this.password, 12); //hash is already asynchron

  this.passwordConfirm = undefined; // no need to store after check same password

  next();
});

// Update passwordChangedAt whenever password is changed or is New
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  };
  
  // - 1 sec because sometimes saving it to database takes longer than creating token
  // so it is to avoid refusing token. ( passwordChangedAt must be < than Token iat)
  this.passwordChangedAt = Date.now() - 1000;
  
  next();

});


userSchema.pre(/^find/, function(next){
  // this point to the current query
  this.find({ active: { $ne: false}}); // not equal to false
  next();
});

// Instant method to check password if it is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
  if (this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimeStamp; 
    // if time token was issued is ealier than pw change
    // retun True for password was changed after
  };
  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Encrypt the token in database
  this.passwordResetToken = crypto
    .createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10*60*1000; // 10 mins

  //send the unencrypted token
  return resetToken;
  };
const User = mongoose.model('User', userSchema);

module.exports = User;