const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const factory = require('./handlersFactory');
const {
	uploadMixOfImages,
} = require('../middlewares/uploadImageMiddleware');
const Product = require('../models/productModel');

exports.uploadProductImages = uploadMixOfImages([
	{ name: 'imageCover', maxCount: 1 },
	{ name: 'images', maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
	if (req.files.imageCover) {
		const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

		await sharp(req.files.imageCover[0].buffer)
			.resize(2000, 1333)
			.toFormat('jpeg')
			.jpeg({ quality: 95 })
			.toFile(`uploads/products/${imageCoverFileName}`);

		req.body.imageCover = imageCoverFileName;
	}

	if (req.files.images) {
		req.body.images = [];

		await Promise.all(
			req.files.images.map(async (img, index) => {
				const imageName = `product-${uuidv4()}-${Date.now()}-${
					index + 1
				}.jpeg`;

				await sharp(img.buffer)
					.resize(2000, 1333)
					.toFormat('jpeg')
					.jpeg({ quality: 95 })
					.toFile(`uploads/products/${imageName}`);

				// Save image into our DB
				req.body.images.push(imageName);
			})
		);

		next();
	}
});

// @desc	Get list of products
// @route	GET /api/products
// @access	Public
exports.getProducts = factory.getAll(Product, 'Products');

// @desc	Get specific product by id
// @route	GET /api/products/:id
// @access	Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @desc	Create product
// @route	POST /api/products
// @access	Private/admin & manager
exports.createProduct = factory.createOne(Product);

// @desc	Update specific product by id
// @route	PUT /api/products/:id
// @access	Private/admin & manager
exports.updateProduct = factory.updateOne(Product);

// @desc	Delete specific product by id
// @route	DELETE /api/products/:id
// @access	Private/admin
exports.deleteProduct = factory.deleteOne(Product);
