const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
	asyncHandler(async (req, res) => {
		const document = await Model.create(req.body);
		res.status(201).json({ data: document });
	});

exports.getAll = (Model, modelName = '') =>
	asyncHandler(async (req, res) => {
		let filter = {};
		if (req.filterObj) filter = req.filterObj;

		// Build query
		const countDocuments = await Model.countDocuments();
		const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
			.paginate(countDocuments)
			.filter()
			.search(modelName)
			.limitFields()
			.sort();

		// Execute query
		const { mongooseQuery, paginationResult } = apiFeatures;
		const documents = await mongooseQuery;

		res.status(200).json({
			results: documents.length,
			paginationResult,
			data: documents,
		});
	});

exports.getOne = (Model, populationOpt) =>
	asyncHandler(async (req, res, next) => {
		const { id } = req.params;
		// Build query
		let query = await Model.findById(id);
		if (populationOpt) {
			query = query.populate(populationOpt);
		}

		// Execute query
		const document = await query;
		if (!document) {
			return next(
				new ApiError(`No document for this id ${id}`, 404)
			);
		}

		res.status(200).json({ data: document });
	});

exports.updateOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		const { id } = req.params;
		const document = await Model.findByIdAndUpdate(id, req.body, {
			new: true,
		});

		if (!document) {
			return next(
				new ApiError(`No document for this id ${id}`, 404)
			);
		}

		// Trigger "save" event when update document
		document.save();
		res.status(200).json({ data: document });
	});

exports.deleteOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		const { id } = req.params;
		const document = await Model.findByIdAndDelete(id);

		if (!document) {
			return next(
				new ApiError(`No document for this id ${id}`, 404)
			);
		}

		// Trigger "remove" event when update document
		document.remove();
		res.status(204).send();
	});
