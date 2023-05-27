const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
      maxlength: [30, 'A prouct name must have fewer or equal 30 chars'],
      minlength: [1, 'A product name must have more or equal 1 char']
      // validate: [validator.isAlpha, 'Tour name must only contain chars'] // use of validator
   },

   description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true,
    maxlength: [100, 'A product description must be fewer or equal 100 chars'],
    minlength: [1, 'A product description must be more or equal 1 char']
   },

   price: {
    type: Number,
    required: [true, 'A product must have a price'],
    default: 0
   },

   discountCode: {
    type: String,
    select: false
   }


  },

  {
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
  }
);

// INDEXING

// Virtual populate

// MIDDLEWARE

// modeling

const Product = mongoose.model('Product', productSchema);


module.exports = Product;