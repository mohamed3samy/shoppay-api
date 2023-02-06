const router = require('express').Router();

const {
	createCashOrder,
	filterOrderForLoggedUser,
	getAllOrders,
	getOrder,
	updateOrderToPaid,
	updateOrderToDelivered,
	checkoutSession,
} = require('../services/orderService');
const { protect, allowedTo } = require('../services/authService');

router.use(protect);

router.route('/:cartId').post(allowedTo('user'), createCashOrder);
router.get(
	'/',
	allowedTo('user', 'admin', 'manager'),
	filterOrderForLoggedUser,
	getAllOrders
);
router.get('/:id', getOrder);
router.put('/:id/pay', allowedTo('admin', 'manager'), updateOrderToPaid);
router.put(
	'/:id/deliver',
	allowedTo('admin', 'manager'),
	updateOrderToDelivered
);
router.get(
	'/checkout-session/:cartId',
	allowedTo('user'),
	checkoutSession
);

module.exports = router;
