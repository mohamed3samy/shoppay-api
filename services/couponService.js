const factory = require('./handlersFactory');
const Coupon = require('../models/couponModel');

// @desc    Get list of coupons
// @route   GET /api/coupons
// @access  Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @desc    Get specific coupon by id
// @route   GET /api/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create coupon
// @route   POST  /api/coupons
// @access  Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @desc    Update specific coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
