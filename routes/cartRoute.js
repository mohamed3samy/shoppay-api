const router = require('express').Router();

const {
	addProductToCart,
	getLoggedUserCart,
	updateCartItemQuantity,
	removeSpecificCartItem,
	clearCart,
	applyCoupon,
} = require('../services/cartService');
const { protect, allowedTo } = require('../services/authService');

router.use(protect, allowedTo('user'));

router
	.route('/')
	.post(addProductToCart)
	.get(getLoggedUserCart)
	.delete(clearCart);

router.put('/applyCoupon', applyCoupon);

router
	.route('/:itemId')
	.put(updateCartItemQuantity)
	.delete(removeSpecificCartItem);

module.exports = router;
