const router = require('express').Router();

const {
	getCategoryValidator,
	createCategoryValidator,
	updateCategoryValidator,
	deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');
const {
	getCategories,
	createCategory,
	getCategory,
	updateCategory,
	deleteCategory,
	uploadCategoryImage,
	resizeImage,
} = require('../services/categoryService');
const subCategoriesRoute = require('./subCategoryRoute');
const { protect, allowedTo } = require('../services/authService');

// Nested route
router.use('/:categoryId/subcategories', subCategoriesRoute);

router
	.route('/')
	.get(getCategories)
	.post(
		protect,
		allowedTo('admin', 'manager'),
		uploadCategoryImage,
		resizeImage,
		createCategoryValidator,
		createCategory
	);
router
	.route('/:id')
	.get(getCategoryValidator, getCategory)
	.put(
		protect,
		allowedTo('admin', 'manager'),
		uploadCategoryImage,
		resizeImage,
		updateCategoryValidator,
		updateCategory
	)
	.delete(
		protect,
		allowedTo('admin'),
		deleteCategoryValidator,
		deleteCategory
	);

module.exports = router;
