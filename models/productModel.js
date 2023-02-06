const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: [
				3,
				'product title must have at least 3 characters',
			],
			maxlength: [
				120,
				'product title must have at most 120 characters',
			],
		},
		slug: {
			type: String,
			required: true,
			lowercase: true,
		},
		description: {
			type: String,
			required: [true, 'Product description is required'],
			minlength: [
				20,
				'product description must have at least 20 characters',
			],
		},
		quantity: {
			type: Number,
			required: [true, 'Product quantity is required'],
		},
		sold: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'Product price is required'],
			trim: true,
			max: [200000, 'Too long product price'],
		},
		priceAfterDiscount: {
			type: Number,
		},
		colors: [String],
		imageCover: {
			type: String,
			required: [true, 'Product image cover is required'],
		},
		images: [String],
		category: {
			type: mongoose.Schema.ObjectId,
			ref: 'Category',
			required: [true, 'Product must be belong to category'],
		},
		subcategories: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'SubCategory',
			},
		],
		brand: {
			type: mongoose.Schema.ObjectId,
			ref: 'Brand',
		},
		ratingsAverage: {
			type: Number,
			min: [1, 'Rating must be above or equal 1.0'],
			max: [5, 'Rating must be below or equal 5.0'],
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		// to enable virtual populate
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

productSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'product',
	localField: '_id',
});

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
	this.populate({ path: 'category', select: 'name -_id' });
	next();
});

const setImageURL = (doc) => {
	if (doc.imageCover) {
		const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
		doc.imageCover = imageUrl;
	}

	if (doc.images) {
		const imagesList = [];

		doc.images.forEach((image) => {
			const imageUrl = `${process.env.BASE_URL}/products/${image}`;
			imagesList.push(imageUrl);
		});

		doc.images = imagesList;
	}
};

// findOne, findAll and update
productSchema.post('init', (doc) => {
	setImageURL(doc);
});

// create
productSchema.post('save', (doc) => {
	setImageURL(doc);
});

module.exports = mongoose.model('Product', productSchema);
