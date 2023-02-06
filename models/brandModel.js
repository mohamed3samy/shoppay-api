const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Brand required'],
			unique: [true, 'Brand must be unique'],
			minlength: [3, 'Brand name must have at least 3 characters'],
			maxlength: [32, 'Brand name must have at least 32 characters'],
		},

		slug: {
			type: String,
			lowercase: true,
		},
		image: String,
	},
	{ timestamps: true }
);

const setImageURL = (doc) => {
	if (doc.image) {
		const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
		doc.image = imageUrl;
	}
};

// findOne, findAll and update
brandSchema.post('init', (doc) => {
	setImageURL(doc);
});

// create
brandSchema.post('save', (doc) => {
	setImageURL(doc);
});

module.exports = mongoose.model('Brand', brandSchema);
