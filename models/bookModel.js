const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Please provide the book name.'],
			trim: true,
			unique: true
		},
		author: [
			{
				type: String,
				default: 'NULL'
			}
		],
		press: {
			type: String,
			default: 'NULL',
			trim: true
		},
		ISBN: {
			type: String,
			default: 'NULL',
			trim: true
		},
		summary: {
			type: String,
			default: 'NULL'
		},
		publishDate: { type: Date, default: undefined },
		cover: {
			type: String
		},
		categories: String,
		language: String,
		ratingsAverage: {
			type: Number,
			default: 2.5,
			min: [0, 'Rating must be above 0'],
			max: [5.0, 'Rating must be below 5.0'],
			set: (val) => Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		uploadAt: {
			type: Date,
			default: Date.now
		},
		verify: {
			type: Boolean,
			default: false
		},
		downloadTimes: {
			type: Number,
			default: 0
		},
		filename: {
			type: String
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

bookSchema.index({ downloadTimes: -1, ratingsAverage: -1 });

// Virtual populate
bookSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'book',
	localField: '_id'
});

// QUERY MIDDLEWARE
bookSchema.pre(/^find/, function (next) {
	// this.find({ verify: { $ne: false } });
	this.start = Date.now();
	next();
});

bookSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds!`);
	next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
