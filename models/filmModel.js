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
      minlength: [1, 'A tour name must have more or equal 11 chars']
      // validate: [validator.isAlpha, 'Tour name must only contain chars'] // use of validator
   },

    slug: String,

    length: {
    type: String,
    validate: {
      validator: function (value) {
        const timeFormatRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/;
        return timeFormatRegex.test(value);
      },
      message: 'Invalid length format. Length must be in HH:MM:SS format.',
    }
    },

    date: {
    type: Date,
    },

    link: {
    type: String,
    required: [true, 'A film must have a source link'],
    validate: [validator.isURL, 'Link source film must be in URL format'],
    trim: true
    },

    description: {
    type: String,
    default: this.name
    },

    actors: {
    type: [String],
    trim: true
    },

    genres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama','Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Anime', 'K-Drama'],
      required: [true, 'Must have genre tag']
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


// MIDDLEWARE

filmSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {  lower: true });
  next();
});


// modeling

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