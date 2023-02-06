const SubCategory = require('../models/subCategoryModel');
const factory = require('./handlersFactory');

// @desc	Nested route
// @route   GET /api/categories/categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
	let filterObj = {};

	if (req.params.categoryId)
		filterObj = { category: req.params.categoryId };

	req.filterObj = filterObj;
	next();
};

// @desc	Get list of Subcategories
// @route	GET /api/subcategories
// @access	Public
exports.getSubCategories = factory.getAll(SubCategory);

// 	@desc	Nested route (Create)
// @route   GET /api/categories/categoryId/subcategories
exports.setCategoryIdToBody = (req, res, next) => {
	if (!req.body.category) req.body.category = req.params.categoryId;

	next();
};

// @desc    Create subCategory
// @route   POST /api/subcategories
// @access  Private/admin & manager
exports.createSubCategory = factory.createOne(SubCategory);

// @desc	Get specific Subcategory by id
// @route	GET /api/subcategories/:id
// @access	Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc	Update specific subCategory by id
// @route	PUT /api/subcategories/:id
// @access	Private/admin & manager
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc	Delete specific subCategory by id
// @route	DELETE /api/subcategories/:id
// @access	Private/admin

exports.deleteSubCategory = factory.deleteOne(SubCategory);
