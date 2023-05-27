const Product = require('../models/productModel');
const factory = require('./handlerFactory');


exports.createProduct = factory.createOne(Product);
exports.getProduct = factory.getOne(Product);
exports.getAllProducts= factory.getAll(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
