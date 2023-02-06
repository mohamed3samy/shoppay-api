const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const Brand = require('../models/brandModel');
const factory = require('./handlersFactory');
const {
	uploadSingleImage,
} = require('../middlewares/uploadImageMiddleware');

// Upload single image
exports.uploadBrandImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
	const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(600, 600)
		.toFormat('jpeg')
		.jpeg({ quality: 95 })
		.toFile(`uploads/brands/${filename}`);

	// Save image into our db
	req.body.image = filename;

	next();
});

// @desc	Get list of Brands
// @route	GET /api/brands
// @access	Public
exports.getBrands = factory.getAll(Brand);

// @desc	Create Brand
// @route	POST /api/brands
// @access	Private/admin & manager
exports.createBrand = factory.createOne(Brand);

// @desc	Get specific brand by id
// @route	GET /api/brands/:id
// @access	Public
exports.getBrand = factory.getOne(Brand);

// @desc	Update specific brand by id
// @route	PUT /api/brands/:id
// @access	Private/admin & manager
exports.updateBrand = factory.updateOne(Brand);

// @desc	Delete specific brand by id
// @route	DELETE /api/brands/:id
// @access	Private/admin
exports.deleteBrand = factory.deleteOne(Brand);
