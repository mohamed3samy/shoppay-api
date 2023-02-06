const router = require('express').Router({ mergeParams: true });

const {
	createReviewValidator,
	updateReviewValidator,
	getReviewValidator,
	deleteReviewValidator,
} = require('../utils/validators/reviewValidator');
const {
	getReviews,
	getReview,
	createReview,
	updateReview,
	deleteReview,
	createFilterObj,
	setProductIdAndUserIdToBody,
} = require('../services/reviewService');
const { allowedTo, protect } = require('../services/authService');

router
	.route('/')
	.get(createFilterObj, getReviews)
	.post(
		protect,
		allowedTo('user'),
		setProductIdAndUserIdToBody,
		createReviewValidator,
		createReview
	);
router
	.route('/:id')
	.get(getReviewValidator, getReview)
	.put(
		protect,
		allowedTo('user'),

		updateReviewValidator,
		updateReview
	)
	.delete(
		protect,
		allowedTo('user', 'admin', 'manager'),
		deleteReviewValidator,
		deleteReview
	);

module.exports = router;
