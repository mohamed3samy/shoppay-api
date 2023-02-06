const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const createToken = require('../utils/createToken');
const factory = require('./handlersFactory');
const {
	uploadSingleImage,
} = require('../middlewares/uploadImageMiddleware');
const ApiError = require('../utils/apiError');

exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
	const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

	if (req.file) {
		await sharp(req.file.buffer)
			.resize(600, 600)
			.toFormat('jpeg')
			.jpeg({ quality: 95 })
			.toFile(`uploads/users/${filename}`);

		// Save profile image into our DB
		req.body.profileImg = filename;
	}

	next();
});

// @desc	Get list of users
// @route	GET /api/users
// @access	Private/admin
exports.getUsers = factory.getAll(User);

// @desc	Create user
// @route	POST /api/users
// @access	Private/admin
exports.createUser = factory.createOne(User);

// @desc	Get specific user by id
// @route	GET /api/users/:id
// @access	Private/admin
exports.getUser = factory.getOne(User);

// @desc	Update specific user by id
// @route	PUT /api/users/:id
// @access	Private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const { name, slug, phone, email, profileImg, role } = req.body;
	const document = await User.findByIdAndUpdate(
		req.params.id,
		{ name, slug, phone, email, profileImg, role },
		{
			new: true,
		}
	);

	if (!document) {
		return next(
			new ApiError(`No document for this id ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
	const document = await User.findByIdAndUpdate(
		req.params.id,
		{
			password: await bcrypt.hash(req.body.password, 12),
			passwordChangedAt: Date.now(),
		},
		{
			new: true,
		}
	);

	if (!document) {
		return next(
			new ApiError(`No document for this id ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ data: document });
});

// @desc	Delete specific user by id
// @route	DELETE /api/users/:id
// @access	Private/admin
exports.deleteUser = factory.deleteOne(User);

// @desc	Get logged user data
// @route	GET /api/users/getMe
// @access	Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
	req.params.id = req.user._id;
	next();
});

// @desc	Update logged user password
// @route	PUT /api/users/changeMyPassword
// @access	Private/protect
exports.changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
	// Change user password based user payload (req.user._id)
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{
			password: await bcrypt.hash(req.body.password, 12),
			passwordChangedAt: Date.now(),
		},
		{ new: true }
	);

	// Generate a new token for the user after changing his password
	const token = createToken(user._id);

	res.status(200).json({ data: user, token });
});

// @desc	Update logged user data (without password, role)
// @route	PUT /api/users/updateMe
// @access	Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
	const { name, email, phone, profileImg } = req.body;

	const updatedUser = await User.findByIdAndUpdate(
		req.user._id,
		{ name, email, phone, profileImg },
		{ new: true }
	);

	res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/users/deleteMe
// @access  Private/Protect
exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, { active: false });
	res.status(204).json({ status: 'Success' });
});
