const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Coupon name required'],
			unique: true,
		},
		expire: {
			//mm/dd/yy
			//03/25/2022  -->25-3-2022
			type: Date,
			required: [true, 'Coupon expire time required'],
		},
		discount: {
			type: Number,
			required: [true, 'Coupon discount value required'],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
