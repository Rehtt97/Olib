const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRoute = require('./routes/userRoutes');
const bookRoute = require('./routes/bookRoutes');
const reviewRoute = require('./routes/reviewRoutes');
const viewRoute = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middleware

// Implement CORS
app.use(cors());
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'resource/books')));

// File upload
app.use(
	fileUpload({
		limits: {
			fileSize: 100 * 1024 * 1024
		},
		abortOnLimit: true,
		limitHandler: (req, res) => {
			res.status(400).json({
				status: 'fail',
				message: 'The file you upload was oversized.'
			});
		}
	})
);

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from the same IP
const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: 'Too many request from this IP, please try again in one hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// TODO Implement the whiteList later
// Prevent parameter pollution
app.use(
	hpp({
		whitelist: 'ratingsAverage'
	})
);

app.use('/', viewRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/books', bookRoute);
app.use('/api/v1/reviews', reviewRoute);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
