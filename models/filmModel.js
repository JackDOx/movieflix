const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const filmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A film must have a name'],
      trim: true,
      maxlength: [30, "A film name must have fewer or equal 30 chars"],
      minlength: [1, 'A film name must have more or equal 1 chars']
      // validate: [validator.isAlpha, 'Tour name must only contain chars'] // use of validator
   },

    name_vn:{
      type: String,
      required: [true, 'A film must have a Vietnamese name'],
      trim: true,
      maxlength: [30, 'A film must have fewer or equal 30 chars'],
      minlength: [1, 'A film name must have more or equal 1 char']
    },

    slug: String,
    slug_vn: String,

    length: {
    type: String,
    validate: {
      validator: function (value) {
        const timeFormatRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/;
        return timeFormatRegex.test(value);
      },
      message: 'Invalid length format. Length must be in HH:MM:SS format.',
    }
    },

    year: {
      type: Date,
      required: [true, 'film must have a publish year'],
      trim: true
    },

    uploadDate: {
      type: Date,
      default: Date.now(),
    },

    link: {
      type: String,
      required: [true, 'A film must have a source link'],
      validate: [validator.isURL, 'Link source film must be in URL format'],
      trim: true,
      select: false
    },

    description: {
      type: String,
      default: this.name,
      maxlength: [1000, 'The description of the film must be fewer or equal 500 words']
    },
    description_vn : {
      type: String,
      default: this.name,
      maxlength: [1000, 'The description of the film must be fewer or equal 500 words']
    },

    poster: {
      type: String,
      required: [true, 'A film must have a poster'],
    },

    filmImage: {
      type: String,
      required: [true, 'A film must have an image cut from fim']
    },

    director: {
      type: String,
      trim: true,
      required: [true, 'A film must have a director'],
      maxlength: [30, "A name must have fewer or equal 30 chars"],
      minlength: [1, 'A name must have more or equal 1 chars']
    },

    actors: {
    type: [String],
    trim: true
    },

    filmType: {
      type: String,
      enum: ['Series', 'Movies'],
      required: [true, 'A film must have a type- series or movies']
    },

    genres: {
      type: [String],
      enum: ['Action & Adventure', 'Comedy', 'Drama','Fantasy', 
      'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Anime & Anime', 'K-Drama', "Children & Family", "Classic", "Asian & Chinese", "Cinema"],
      required: [true, 'Must have genre tag']
    },

    ratingsAverage: {
      type: Number,
      default: 4.8,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be lower 5.0']
    },

    ratingsQuantity: {
      type: Number,
      default: 0
    },

    hot: {
      type: Boolean,
      default: false
    },

    views: {
      type: Number,
      default: 0
  }

  },

  {
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
  }
);

// INDEXING
filmSchema.index({ slug: 1});
filmSchema.index({ slug_vn: 1});

// Virtual populate
filmSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'film', // the field in Review that holds the reference to the current model
  localField: '_id' // the name of the field in the current model correspond to the foreign field

});
// MIDDLEWARE

filmSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {  lower: true });
  this.slug_vn= slugify(this.name_vn, { lower: true});
  next();
});


// modeling
// comment added

const Film = mongoose.model('Film', filmSchema);

// const film = new Film({
//   name: 'Example Film',
//   length: '01:44:32',
//   link: 'example.com',
//   actors: ['Actor 1', 'Actor 2', 'Actor 3'],
//   genres: ['Action', 'Comedy'],
//   views: 100
// });

// film.save()
//   .then(() => {
//     console.log('Film saved successfully');
//   })
//   .catch((err) => {
//     console.error('Error:', err.message);
//   });

module.exports = Film;