const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const Category = require('../models/categoryModel');
const {
	uploadSingleImage,
} = require('../middlewares/uploadImageMiddleware');
const factory = require('./handlersFactory');

// Upload single image
exports.uploadCategoryImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
	const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

	if (req.file) {
		await sharp(req.file.buffer)
			.resize(600, 600)
			.toFormat('jpeg')
			.jpeg({ quality: 95 })
			.toFile(`uploads/categories/${filename}`);

		// Save image into our db
		req.body.image = filename;
	}

	next();
});

// @desc	Get list of categories
// @route	GET /api/categories
// @access	Public
exports.getCategories = factory.getAll(Category);

// @desc	Create category
// @route	POST /api/categories
// @access	Private/admin & manager
exports.createCategory = factory.createOne(Category);

// @desc	Get specific category by id
// @route	GET /api/categories/:id
// @access	Public
exports.getCategory = factory.getOne(Category);

// @desc	Update specific category by id
// @route	PUT /api/categories/:id
// @access	Private/admin & manager
exports.updateCategory = factory.updateOne(Category);

// @desc	Delete specific category by id
// @route	DELETE /api/categories/:id
// @access	Private/admin
exports.deleteCategory = factory.deleteOne(Category);
