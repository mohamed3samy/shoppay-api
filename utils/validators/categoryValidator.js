const { check, body } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid category id format'),
	validatorMiddleware,
];

exports.createCategoryValidator = [
	check('name')
		.notEmpty()
		.withMessage('category name is required')
		.trim()
		.isLength({ min: 3 })
		.withMessage('category name must have at least 3 characters')
		.isLength({ max: 32 })
		.withMessage('category name must have at most 32 characters')
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	validatorMiddleware,
];

exports.updateCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid category id format'),
	body('name')
		.optional()
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	validatorMiddleware,
];

exports.deleteCategoryValidator = [
	check('id').isMongoId().withMessage('Invalid category id format'),
	validatorMiddleware,
];
