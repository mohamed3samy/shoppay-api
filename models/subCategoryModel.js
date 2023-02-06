const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			unique: [true, "Subcategory must be uinque"],
			minlength: [
				2,
				"Subcategory name must have at least 2 characters",
			],
			maxlength: [
				32,
				"Subcategory name must have at least 32 characters",
			],
		},
		slug: {
			type: String,
			lowercase: true,
		},
		category: {
			type: mongoose.Schema.ObjectId,
			ref: "Category",
			required: [
				true,
				"Subcategory must be belong to parent category",
			],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
