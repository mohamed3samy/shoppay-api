const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const createToken = require('../utils/createToken');
const sendEmail = require('../utils/sendEmail');
const ApiError = require('../utils/apiError');

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
	const { name, email, password } = req.body;

	const user = await User.create({
		name,
		email,
		password,
	});

	const token = createToken(user._id);

	res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user || !(await bcrypt.compare(password, user.password))) {
		return next(new ApiError('Incorrect email or password', 401));
	}

	const token = createToken(user._id);

	// delete user password from response
	delete user._doc.password;

	res.status(200).json({ data: user, token });
});

// @desc make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
	// 1) Check if token exist, if exist get it.
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(
			new ApiError(
				' You are not login, please login to get access this route',
				401
			)
		);
	}

	// 2) verify token (no change happens, expired token)
	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

	// 3) Check if user exists
	const currentUser = await User.findById(decoded.userId);

	if (!currentUser) {
		return next(
			new ApiError(
				'the user that belong to this token does no longer exist',
				401
			)
		);
	}

	// 3) Check if user change his password after token created
	if (currentUser.passwordChangedAt) {
		const passChangedTimestamp = parseInt(
			currentUser.passwordChangedAt.getTime() / 1000,
			10
		);

		// Password changed after token created (Error)
		if (passChangedTimestamp > decoded.iat) {
			return next(
				new ApiError(
					'user recently changed his password, please login again.',
					401
				)
			);
		}
	}

	req.user = currentUser;
	next();
});

// @desc Authorization (user permissions)
exports.allowedTo = (...roles) =>
	asyncHandler(async (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ApiError(
					'You are not allowed to access this route',
					403
				)
			);
		}

		next();
	});

// @desc    Forgot password
// @route   POST /api/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(
			new ApiError('There is no user with this email.', 404)
		);
	}

	// generate hash reset random 6 digits.
	const resetCode = Math.floor(
		100000 + Math.random() * 900000
	).toString();
	const hashedResetCode = crypto
		.createHash('sha256')
		.update(resetCode)
		.digest('hex');

	// save hashed password reset code into DB
	user.passwordResetCode = hashedResetCode;
	// add expiration time for password reset code (10 min)
	user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	user.passwordResetVerified = false;

	await user.save();

	// send the reset code via email
	const message = `Hi ${user.name},\n We received a request to reset the password on your Shoppay Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Shoppay Team`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset code (valid for 10 min)',
			message,
		});
	} catch (err) {
		user.passwordResetCode = undefined;
		user.passwordResetExpires = undefined;
		user.passwordResetVerified = undefined;

		await user.save();
		return next(
			new ApiError('There is an error in sending email', 500)
		);
	}

	res.status(200).json({
		status: 'Success',
		message: 'Reset code sent to your email',
	});
});

// @desc    Verify password reset code
// @route   POST /api/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
	const hashedResetCode = crypto
		.createHash('sha256')
		.update(req.body.resetCode)
		.digest('hex');

	const user = await User.findOne({
		passwordResetCode: hashedResetCode,
		passwordResetExpires: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ApiError('Reset code invalid or expired'));
	}

	user.passwordResetVerified = true;
	await user.save();

	res.status(200).json({ status: 'Success' });
});

// @desc    Reset password
// @route   PUT /api/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	const { email, newPassword } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		return next(
			new ApiError('There is no user with this email.', 404)
		);
	}

	if (!user.passwordResetVerified) {
		return next(new ApiError('Reset code not verified', 400));
	}

	user.password = newPassword;
	user.passwordResetCode = undefined;
	user.passwordResetExpires = undefined;
	user.passwordResetVerified = undefined;

	await user.save();

	// Generate a new token for the user after resetting the password
	const token = createToken(user._id);
	res.status(200).json({ token });
});
