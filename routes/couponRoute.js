const router = require('express').Router();

const {
	getCoupon,
	getCoupons,
	createCoupon,
	updateCoupon,
	deleteCoupon,
} = require('../services/couponService');
const {
	createCouponValidator,
	deleteCouponValidator,
	getCouponValidator,
	updateCouponValidator,
} = require('../utils/validators/couponValidator');
const { protect, allowedTo } = require('../services/authService');

router.use(protect, allowedTo('admin', 'manager'));

router
	.route('/')
	.get(getCoupons)
	.post(createCouponValidator, createCoupon);
router
	.route('/:id')
	.get(getCouponValidator, getCoupon)
	.put(updateCouponValidator, updateCoupon)
	.delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
