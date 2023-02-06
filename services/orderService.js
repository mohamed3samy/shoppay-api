const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

// @desc    create cash order
// @route   POST /api/orders/cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
	// app settings [Admin]
	const taxPrice = 0;
	const shippingPrice = 0;

	const cart = await Cart.findById(req.params.cartId);
	if (!cart) {
		return next(new ApiError('There is no cart with this id', 404));
	}

	// Get order price depend on cart price "Check if coupon apply"
	const cartPrice = cart.totalPriceAfterDiscount
		? cart.totalPriceAfterDiscount
		: cart.totalCartPrice;

	const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

	// Create order with default paymentMethodType cash
	const order = await Order.create({
		user: req.user._id,
		cartItems: cart.cartItems,
		shippingAddress: req.body.shippingAddress,
		totalOrderPrice,
	});

	// decrement product quantity & increment product sold after creating order.
	if (order) {
		const bulkOption = cart.cartItems.map((item) => ({
			updateOne: {
				filter: { _id: item.product },
				update: {
					$inc: {
						quantity: -item.quantity,
						sold: +item.quantity,
					},
				},
			},
		}));

		await Product.bulkWrite(bulkOption, {});

		// Clear Cart depend on cartId
		await Cart.findByIdAndDelete(req.params.cartId);
	}

	res.status(201).json({ status: 'success', data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
	if (req.user.role === 'user') req.filterObj = { user: req.user._id };
	next();
});

// @desc    Get all orders
// @route   POST /api/orders
// @access  Protected/User-Admin-Manager
exports.getAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   POST /api/orders/:id
// @access  Protected/User-Admin-Manager
exports.getOrder = factory.getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return next(new ApiError('There is no order with this id.', 404));
	}

	// update order to paid
	order.isPaid = true;
	order.paidAt = Date.now();

	const updateOrder = await order.save();

	res.status(200).json({ status: 'success', data: updateOrder });
});

// @desc    Update order delivered status
// @route   PUT /api/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return next(new ApiError('There is no order with this id.', 404));
	}

	// update order to delivered
	order.isDelivered = true;
	order.deliveredAt = Date.now();

	const updateOrder = await order.save();

	res.status(200).json({ status: 'success', data: updateOrder });
});

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
	// app settings [Admin]
	const taxPrice = 0;
	const shippingPrice = 0;

	const cart = await Cart.findById(req.params.cartId);
	if (!cart) {
		return next(new ApiError('There is no cart with this id', 404));
	}

	// Get order price depend on cart price "Check if coupon apply"
	const cartPrice = cart.totalPriceAfterDiscount
		? cart.totalPriceAfterDiscount
		: cart.totalCartPrice;

	const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

	// Create stripe checkout session
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: 'egp',
					unit_amount: totalOrderPrice * 100,
					product_data: {
						name: req.user.name,
					},
				},
				quantity: 1,
			},
		],

		mode: 'payment',
		success_url: `${req.protocol}://${req.get('host')}/api/orders`,
		cancel_url: `${req.protocol}://${req.get('host')}/api/cart`,
		customer_email: req.user.email,
		client_reference_id: req.params.cartId,
		metadata: req.body.shippingAddress,
	});

	res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (session) => {
	const cartId = session.client_reference_id;
	const shippingAddress = session.metadata;
	const oderPrice = session.amount_total / 100;

	const cart = await Cart.findById(cartId);
	const user = await User.findOne({ email: session.customer_email });

	// Create order with default paymentMethodType card
	const order = await Order.create({
		user: user._id,
		cartItems: cart.cartItems,
		shippingAddress,
		totalOrderPrice: oderPrice,
		isPaid: true,
		paidAt: Date.now(),
		paymentMethodType: 'card',
	});

	if (order) {
		const bulkOption = cart.cartItems.map((item) => ({
			updateOne: {
				filter: { _id: item.product },
				update: {
					$inc: {
						quantity: -item.quantity,
						sold: +item.quantity,
					},
				},
			},
		}));

		await Product.bulkWrite(bulkOption, {});
		await Cart.findByIdAndDelete(cartId);
	}
};

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
	const sig = req.headers['stripe-signature'];
	let event;
  
	try {
	  event = stripe.webhooks.constructEvent(
		req.body,
		sig,
		process.env.STRIPE_WEBHOOK_SECRET
	  );
	} catch (err) {
	  return res.status(400).send(`Webhook Error: ${err.message}`);
	}
	if (event.type === 'checkout.session.completed') {
	  //  Create order
	  createCardOrder(event.data.object);
	}
  
	res.status(200).json({ received: true });
  });
