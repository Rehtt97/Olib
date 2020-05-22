const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
	let filterObj = {};
	if (req.params.bookId) filterObj = { book: req.params.bookId };
	const reviews = await Review.find(filterObj);
	res.status(200).json({
		status: 'success',
		result: reviews.length,
		data: {
			reviews
		}
	});
});

exports.setUserBookID = (req, res, next) => {
	if (!req.body.user) req.body.user = req.user.id;
	if (!req.body.book) req.body.book = req.params.bookId;
	next();
};
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
