const mongoose = require('mongoose');
const Book = require('./bookModel');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Review cannot be empty.'],
			trim: true
		},
		rating: {
			type: Number,
			min: 0,
			max: 5
		},
		createAt: {
			type: Date,
			default: Date.now
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belongs to a user.']
		},
		book: {
			type: mongoose.Schema.ObjectId,
			ref: 'Book',
			required: [true, 'Review must belongs to a book.']
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'username avatar'
	});
	next();
});

reviewSchema.statics.calcAverageRatings = async function (bookId) {
	const stats = await this.aggregate([
		{
			$match: { book: bookId }
		},
		{
			$group: {
				_id: '$book',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' }
			}
		}
	]);
	if (stats.length > 0) {
		await Book.findByIdAndUpdate(bookId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating
		});
	} else {
		await Book.findByIdAndUpdate(bookId, {
			ratingsQuantity: 0,
			ratingsAverage: 2.5
		});
	}
};

reviewSchema.index({ book: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
	this.constructor.calcAverageRatings(this.book);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
	this.r = await this.findOne();
	next();
});

reviewSchema.post(/^findOneAnd/, async function () {
	await this.r.constructor.calcAverageRatings(this.r.book);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
