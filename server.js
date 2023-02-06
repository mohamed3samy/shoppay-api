const path = require('path');

const dotenv = require('dotenv').config();
const express = require('express');

const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require("xss-clean");

const dbConnection = require('./config/database');
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./services/orderService');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

dbConnection();

const app = express();

app.use(cors());
app.options('*', cors());

// compress all responses
app.use(compression());

// Checkout webhook
app.post(
	'/webhook-checkout',
	express.raw({ type: 'application/json' }),
	webhookCheckout
);

// Middlewares
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
	console.log(`mode: ${process.env.NODE_ENV}`);
}

// To apply data sanitization
app.use(mongoSanitize());
app.use(xss());

// Limit each IP to 100 requests per `window`.
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message:
		'Too many accounts created from this IP, please try again after 15 minutes',
});

// Apply the rate limiting middleware to login & forgotPassword
app.use('/api/auth/login', limiter);
app.use('/api/auth/forgotPassword', limiter);

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
	hpp({
		whitelist: [
			'price',
			'sold',
			'quantity',
			'ratingsAverage',
			'ratingsQuantity',
		],
	})
);

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
	next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
	console.log(`App listening on port ${port}!`)
);

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
	console.log(`unhandledRejection Errors: ${err.name} | ${err.message}`);
	server.close(() => {
		console.error('shut down...');
		process.exit(1);
	});
});

