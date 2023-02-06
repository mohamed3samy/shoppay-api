const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const calcTotalCartPrice = (cart) => {
	let totalPrice = 0;

	cart.cartItems.forEach((item) => {
		totalPrice += item.quantity * item.price;
	});

	cart.totalCartPrice = totalPrice;
	cart.totalPriceAfterDiscount = undefined;
	return totalPrice;
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
	const { productId, color } = req.body;

	const product = await Product.findById(productId);

	let cart = await Cart.findOne({ user: req.user._id });

	if (!cart) {
		cart = await Cart.create({
			user: req.user._id,
			cartItems: [
				{ product: productId, color, price: product.price },
			],
		});
	} else {
		// product exists in cart, update cart quantity
		const productIndex = cart.cartItems.findIndex(
			(item) =>
				item.product.toString() === productId &&
				item.color === color
		);

		if (productIndex > -1) {
			const cartItem = cart.cartItems[productIndex];
			cartItem.quantity += 1;
			cart.cartItems[productIndex] = cartItem;
		} else {
			// product not exists in cart, push it to cartItems array
			cart.cartItems.push({
				product: productId,
				color,
				price: product.price,
			});
		}
	}

	calcTotalCartPrice(cart);
	await cart.save();

	res.status(200).json({
		status: 'success',
		message: 'Product added to cart successfully',
		numOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// @desc    Get logged user cart
// @route   GET /api/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOne({ user: req.user._id });

	if (!cart) {
		return next(new ApiError('There is no cart for this user', 404));
	}

	res.status(200).json({
		status: 'success',
		numOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// @desc    Remove specific cart item
// @route   DELETE /api/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
	const cart = await Cart.findOneAndUpdate(
		{ user: req.user._id },
		{ $pull: { cartItems: { _id: req.params.itemId } } },
		{ new: true }
	);

	calcTotalCartPrice(cart);
	await cart.save();

	res.status(200).json({
		status: 'success',
		numOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// @desc	Clear logged user cart
// @route	DELETE /api/cart
// @access	Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
	await Cart.findOneAndDelete({ user: req.user._id });
	res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
	const { quantity } = req.body;

	const cart = await Cart.findOne({ user: req.user._id });

	if (!cart) {
		return next(new ApiError('There is no cart for this user', 404));
	}

	const itemIndex = cart.cartItems.findIndex(
		(item) => item._id.toString() === req.params.itemId
	);

	if (itemIndex > -1) {
		const cartItem = cart.cartItems[itemIndex];
		cartItem.quantity = quantity;
		cart.cartItems[itemIndex] = cartItem;
	} else {
		return next(new ApiError('There is no item for this id', 404));
	}

	calcTotalCartPrice(cart);
	await cart.save();

	res.status(200).json({
		status: 'success',
		numOfCartItems: cart.cartItems.length,
		data: cart,
	});
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
	const coupon = await Coupon.findOne({
		name: req.body.coupon,
		expire: { $gt: Date.now() },
	});

	if (!coupon) {
		return next(new ApiError('Coupon is invalid or expired', 404));
	}

	const cart = await Cart.findOne({ user: req.user._id });
	const totalPrice = cart.totalCartPrice;
	const totalPriceAfterDiscount = (
		totalPrice -
		(totalPrice * coupon.discount) / 100
	).toFixed(2);

	cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
	await cart.save();

	res.status(200).json({
		status: 'success',
		numOfCartItems: cart.cartItems.length,
		data: cart,
	});
});
