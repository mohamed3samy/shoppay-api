const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');

// @desc    Nested route
// @route   GET /api/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
	let filterObject = {};

	if (req.params.productId)
		filterObject = { product: req.params.productId };

	req.filterObj = filterObject;
	next();
};

// @desc    Get list of reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @desc    Nested route (Create)
// @route   POST /api/products/:productId/reviews
exports.setProductIdAndUserIdToBody = (req, res, next) => {
	if (!req.body.product) req.body.product = req.params.productId;

	if (!req.body.user) req.body.user = req.user._id;

	next();
};

// @desc    Create review
// @route   POST  /api/reviews
// @access  Private/Protect/User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/reviews/:id
// @access  Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/reviews/:id
// @access  Private/Protect/(User, Admin, Manager)
exports.deleteReview = factory.deleteOne(Review);
