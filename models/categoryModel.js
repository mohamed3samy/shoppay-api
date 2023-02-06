const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'category name required'],
			unique: [true, 'category name must be unique'],
			minlength: [3, 'too short category name'],
			maxlength: [32, 'too long category name'],
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
		const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
		doc.image = imageUrl;
	}
};

// findOne, findAll and update
categorySchema.post('init', (doc) => {
	setImageURL(doc);
});

// create
categorySchema.post('save', (doc) => {
	setImageURL(doc);
});

// Create Model
module.exports = mongoose.model('Category', categorySchema);
