const express = require('express');
const paymentController = require('./../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:productId', paymentController.getCheckoutSession);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(paymentController.getAllPayments)
  .post(paymentController.createPayment);

router
  .route('/:id')
  .get(paymentController.getPayment)
  .patch(paymentController.updatePayment)
  .delete(paymentController.deletePayment);

module.exports = router;
