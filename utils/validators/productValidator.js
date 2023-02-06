const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");

exports.createProductValidator = [
	check("title")
		.isLength({ min: 3 })
		.withMessage("product title must have at least 3 characters")
		.notEmpty()
		.withMessage("Product required")
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	check("description")
		.notEmpty()
		.withMessage("Product description is required")
		.isLength({ max: 2000 })
		.withMessage(
			"product description must have at most 2000 characters"
		),
	check("quantity")
		.notEmpty()
		.withMessage("Product quantity is required")
		.isNumeric()
		.withMessage("Product quantity must be a number"),
	check("sold")
		.optional()
		.isNumeric()
		.withMessage("Product quantity must be a number"),
	check("price")
		.notEmpty()
		.withMessage("Product price is required")
		.isNumeric()
		.withMessage("Product price must be a number")
		.isLength({ max: 32 })
		.withMessage("Too long product price"),
	check("priceAfterDiscount")
		.optional()
		.isNumeric()
		.withMessage("Product priceAfterDiscount must be a number")
		.toFloat()
		.custom((value, { req }) => {
			if (req.body.price <= value) {
				throw new Error(
					"priceAfterDiscount must be lower than price"
				);
			}
			return true;
		}),
	check("colors")
		.optional()
		.isArray()
		.withMessage("available colors should be array of string"),
	check("imageCover")
		.notEmpty()
		.withMessage("Product image cover is required"),
	check("images")
		.optional()
		.isArray()
		.withMessage("images should be array of string"),
	check("category")
		.notEmpty()
		.withMessage("Product must be belong to a category")
		.isMongoId()
		.withMessage("Invalid id formate")
		.custom((categoryId) =>
			Category.findById(categoryId).then((category) => {
				if (!category) {
					return Promise.reject(
						new Error(`No category for this id: ${categoryId}`)
					);
				}
			})
		),
	check("subcategories")
		.optional()
		.isMongoId()
		.withMessage("Invalid id formate")
		.custom((subcategoriesIds) =>
			SubCategory.find({
				_id: { $exists: true, $in: subcategoriesIds },
			}).then((result) => {
				if (
					result.length < 1 ||
					result.length !== subcategoriesIds.length
				) {
					return Promise.reject(
						new Error(`Invalid subcategories Ids`)
					);
				}
			})
		)
		.custom((value, { req }) =>
			SubCategory.find({ category: req.body.category }).then(
				(subcategories) => {
					const subCategoriesIdsInDB = [];

					subcategories.forEach((subCategory) => {
						subCategoriesIdsInDB.push(
							subCategory._id.toString()
						);
					});

					// Check if subcategories ids in DB include subcategories in req.body (true)
					const checker = (target, arr) =>
						target.every((v) => arr.includes(v));

					if (!checker(value, subCategoriesIdsInDB)) {
						return Promise.reject(
							new Error(
								`subcategories not belong to category`
							)
						);
					}
				}
			)
		),
	check("brand")
		.optional()
		.isMongoId()
		.withMessage("Invalid id formate"),
	check("ratingsAverage")
		.optional()
		.isNumeric()
		.withMessage("Ratings average must be a number")
		.isLength({ min: 1 })
		.withMessage("Rating must be above or equal 1.0")
		.isLength({ max: 5 })
		.withMessage("Rating must be below or equal 5.0"),
	check("ratingsQuantity")
		.optional()
		.isNumeric()
		.withMessage("Ratings quantity must be a number"),
	validatorMiddleware,
];

exports.getProductValidator = [
	check("id").isMongoId().withMessage("Invalid id formate"),
	validatorMiddleware,
];

exports.updateProductValidator = [
	check("id").isMongoId().withMessage("Invalid id formate"),
	body("title")
		.optional()
		.custom((value, { req }) => {
			req.body.slug = slugify(value);
			return true;
		}),
	validatorMiddleware,
];

exports.deleteProductValidator = [
	check("id").isMongoId().withMessage("Invalid id formate"),
	validatorMiddleware,
];
