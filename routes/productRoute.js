const router = require('express').Router();

const {
	getProductValidator,
	createProductValidator,
	updateProductValidator,
	deleteProductValidator,
} = require('../utils/validators/productValidator');
const {
	getProducts,
	createProduct,
	getProduct,
	updateProduct,
	deleteProduct,
	uploadProductImages,
	resizeProductImages,
} = require('../services/productService');
const { protect, allowedTo } = require('../services/authService');
const reviewsRoute = require('./reviewRoute');

router.use('/:productId/reviews', reviewsRoute);

router
	.route('/')
	.get(getProducts)
	.post(
		protect,
		allowedTo('admin', 'manager'),
		uploadProductImages,
		resizeProductImages,
		createProductValidator,
		createProduct
	);

router
	.route('/:id')
	.get(getProductValidator, getProduct)
	.put(
		protect,
		allowedTo('admin', 'manager'),
		uploadProductImages,
		resizeProductImages,
		updateProductValidator,
		updateProduct
	)
	.delete(
		protect,
		allowedTo('admin'),
		deleteProductValidator,
		deleteProduct
	);

module.exports = router;
