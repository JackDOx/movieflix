const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Film = require('../models/filmModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async(req, res, next) =>{
  // 1) Get the currently booked product
 const product = await Product.findById(req.params.productId);

 const transformedItems = [{
     quantity: 1,
     price_data: {
         currency: "usd",
         unit_amount: product.price * 100,
         product_data: {
             name: `${product.name}`,
             description: product.description, //description here
//              images: [`${req.protocol}://${req.get('host')}/img/tours/${product.imageCover}`], //only accepts live images (images hosted on the internet),
         },
     },
 }];

  // 2) Create checkout session
 const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     // success_url: `${req.protocol}://${req.get('host')}/`, //user will be redirected to this url when payment is successful. home page
     // cancel_url: `${req.protocol}://${req.get('host')}/${product.slug}`, //user will be redirected to this url when payment has an issue. product page (previous page)
    //  success_url: `${req.protocol}://${req.get('host')}/?product=${product.id}&user=${req.user.id}&price=${product.price}`,
    //  cancel_url: `${req.protocol}://${req.get('host')}/product/${product.slug}`,

    success_url: `${req.protocol}://${process.env.FRONT_END_DOMAIN}/profile/premium/result/?status=success`,
    cancel_url: `${req.protocol}://${process.env.FRONT_END_DOMAIN}/profile/premium/result/?status=fail`,

     customer_email: req.user.email,
     client_reference_id: req.params.productId, //this field allows us to pass in some data about this session that we are currently creating.
     line_items: transformedItems,
     mode: 'payment',
//RAC HM
 });



  // 3) Create session as response
  res.status(200).json({
     status: 'success',
     session
  })
});

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

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(err);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};



exports.createPayment = factory.createOne(Payment);
exports.getPayment = factory.getOne(Payment);
exports.getAllPayments = factory.getAll(Payment);
exports.updatePayment = factory.updateOne(Payment);
exports.deletePayment = factory.deleteOne(Payment);
