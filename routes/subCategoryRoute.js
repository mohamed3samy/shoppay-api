const router = require('express').Router({ mergeParams: true });

const {
	createSubCategory,
	getSubCategories,
	getSubCategory,
	updateSubCategory,
	deleteSubCategory,
	setCategoryIdToBody,
	createFilterObj,
} = require('../services/subCategoryService');
const {
	createSubcategoryValidator,
	getSubcategoryValidator,
	updateSubcategoryValidator,
	deleteSubcategoryValidator,
} = require('../utils/validators/subCategoryValidator');
const { protect, allowedTo } = require('../services/authService');

router
	.route('/')
	.get(createFilterObj, getSubCategories)
	.post(
		protect,
		allowedTo('admin', 'manager'),
		setCategoryIdToBody,
		createSubcategoryValidator,
		createSubCategory
	);

router
	.route('/:id')
	.get(getSubcategoryValidator, getSubCategory)
	.put(
		protect,
		allowedTo('admin', 'manager'),
		updateSubcategoryValidator,
		updateSubCategory
	)
	.delete(
		protect,
		allowedTo('admin'),
		deleteSubcategoryValidator,
		deleteSubCategory
	);

module.exports = router;
