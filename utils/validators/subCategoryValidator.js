const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getSubcategoryValidator = [
	check("id").isMongoId().withMessage("Invalid Subcategory id format"),
	validatorMiddleware,
];

exports.createSubcategoryValidator = [
	check("name")
		.notEmpty()
		.withMessage("Subcategory required")
		.isLength({ min: 2 })
		.withMessage("Subcategory name must have at least 2 characters")
		.isLength({ max: 32 })
		.withMessage("Subcategory name must have at most 32 characters")
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	check("category")
		.notEmpty()
		.withMessage("Subcategory must be belong to category")
		.isMongoId()
		.withMessage("Invalid Category id format"),
	validatorMiddleware,
];

exports.updateSubcategoryValidator = [
	check("id").isMongoId().withMessage("Invalid Subcategory id format"),
	check("name")
		.notEmpty()
		.withMessage("Subcategory required")
		.isLength({ min: 2 })
		.withMessage("Subcategory name must have at least 2 characters")
		.isLength({ max: 32 })
		.withMessage("Subcategory name must have at most 32 characters"),
	check("category")
		.notEmpty()
		.withMessage("category id must be not empty")
		.isMongoId()
		.withMessage("Invalid category id format"),
	body("name").custom((value, { req }) => {
		req.body.slug = slugify(value);
		return true;
	}),
	validatorMiddleware,
];

exports.deleteSubcategoryValidator = [
	check("id").isMongoId().withMessage("Invalid Subcategory id format"),
	validatorMiddleware,
];
