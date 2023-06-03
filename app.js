const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const filmRouter = require('./routes/filmRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const productRouter = require('./routes/productRoutes');
const paymentController = require('./controllers/paymentController');
const saveRouter = require('./routes/saveRoutes');


const app = express();

// Trust proxy
app.enable('trust proxy');

// Setting pug engine and the file that hold the pug template: views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE

//cross-origin resource sharing
app.use(cors({ credentials: true, origin: true }));
// Allow other type of http request like patch, delete to use cors. " means every routes"
app.options('*', cors());

// Session Cookie Settings
app.use(session({
 
    cookie: { secure: true, samesite :'none' },
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));
// Serving static files
// app.use(express.static(`${__dirname}/public`)); 
app.use(express.static(path.join(__dirname, 'public')));
//http://127.0.0.1:3000/overview.html
// If no routes are found, it will get to public folder

// Set security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
//Development logging
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // produce the req statistics
};

// SECURITY: limiting requests to server : 60 reqs in 1 hour
const limiter = rateLimit({
    max: 60,
    windowMs: 60*60*1000,
    message: 'Too many requests from this ip, please try again in an hour'
});

app.use('/api', limiter); // apply this limiter to /api

const createBookingCheckout = async session => {
  const product = session.client_reference_id;
  const user = (await User.findOneAndUpdate({ email: session.customer_email }, {premium: true, premiumExpires: Date.now() + 30*24*60*60*1000},{
    new: true,
    runValidators: true
  })).id;
  const price = session.amount_total / 100;
  await Payment.create({ product, user, price });

};

// exports.createBookingCheckout = async (req, res, next) => {
//   const {product, user, price} = req.query;

//   if (!product && !user && !price) {
//     return next();
//   };
//   await Product.create({ product,user,price});
  
//   res.redirect(req.originalUrl.split('?')[0]); // redirect to the product page of that booked product
// };.

const webhookCheckout = (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature.toString(),
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(err);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};
// Stripe webhook for payment
app.post('/webhook-checkout', bodyParser.raw({ type: '*/*' }), webhookCheckout);



// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'})); // limit to 10kb request
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // this code is to parse the data from .form
app.use(cookieParser()); // parse the data from cookie

// Data santinization against NoSQL query injection
app.use(mongoSanitize()); // It looks at the reuqery, req body and filter out all dangerouse sign like $

// Data santinization against XSS
app.use(xss()); // Clean user input like dangerous javascript or html code

app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'difficulty',
        'maxGroupSize',
        'price'
    ]
})); // Prevent parameter pollution

app.use(compression());

// Test middleware
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();   // Information of the request
    next();
});


// 3) ROUTES

// Mounting Routes
// app.use('/', viewRouter);

app.use('/api/v1/film', filmRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/save', saveRouter);
// app.use('/api/v1/users', userRouter); //tourRouter is a middleware
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {  // all means all methods, * means all url
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    // });

    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // if next() is passed in argument, it will understands it as error
});

app.use(globalErrorHandler);    // error middleware. Call with next

// 4) SERVER
module.exports = app;
