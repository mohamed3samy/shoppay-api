const { check } = require('express-validator');

const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Coupon = require('../../models/couponModel');

exports.createCouponValidator = [
	check('name')
		.notEmpty()
		.withMessage('Coupon name is required ')
		.trim()
		.custom((couponName, { req }) =>
			Coupon.findOne({ name: couponName }).then((coupon) => {
				if (coupon) {
					return Promise.reject(
						new Error('Coupon with this name already existed')
					);
				}
			})
		),
	check('expire')
		.notEmpty()
		.withMessage('Coupon expiredDate is required '),
	check('discount')
		.notEmpty()
		.withMessage('Coupon discount is required '),
	validatorMiddleware,
];

exports.getCouponValidator = [
	check('id').isMongoId().withMessage('invalid Coupon id format'),
	validatorMiddleware,
];

exports.updateCouponValidator = [
	check('id').isMongoId().withMessage('invalid Coupon id format'),
	validatorMiddleware,
];

exports.deleteCouponValidator = [
	check('id').isMongoId().withMessage('invalid Coupon id format'),
	validatorMiddleware,
];
