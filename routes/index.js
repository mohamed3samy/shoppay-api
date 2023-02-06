const categoryRoute = require('./categoryRoute');
const subCategoryRoute = require('./subCategoryRoute');
const brandRoute = require('./brandRoute');
const productRoute = require('./productRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const reviewRoute = require('./reviewRoute');
const wishlistRoute = require('./wishlistRoute');
const addressRoute = require('./addressRoute');
const couponRoute = require('./couponRoute');
const cartRoute = require('./cartRoute');
const orderRoute = require('./orderRoute');

const mountRoutes = (app) => {
	app.use('/api/categories', categoryRoute);
	app.use('/api/subcategories', subCategoryRoute);
	app.use('/api/brands', brandRoute);
	app.use('/api/products', productRoute);
	app.use('/api/users', userRoute);
	app.use('/api/auth', authRoute);
	app.use('/api/reviews', reviewRoute);
	app.use('/api/wishlist', wishlistRoute);
	app.use('/api/addresses', addressRoute);
	app.use('/api/coupons', couponRoute);
	app.use('/api/cart', cartRoute);
	app.use('/api/orders', orderRoute);
};

module.exports = mountRoutes;
