const Book = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
	// 1) Get the book data from the collection
	const books = await Book.find();

	// 2) Build the template data

	// 3) Render the template using the Books data
	res.status(200).render('overview', {
		title: 'All Books',
		books
	});
});

// exports.getBook = catchAsync(async (req, res, next) => {
//   // 1)
//   const book = await Book.findById(req.params.id);
// });

exports.readBook = (req, res, next) => {
	res.status(200).render('read');
};

exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Login'
	});
};

exports.test = catchAsync(async (req, res, next) => {
	res.status(200).render('upload');
});
