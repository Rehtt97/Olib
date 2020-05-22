const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
// const extract = require('extract-zip');
const Book = require('../models/bookModel');
const DownloadLog = require('../models/downloadLogModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { getMetaData } = require('../utils/epub');
const factory = require('./handlerFactory');

const {
	isFileExists,
	deleteBook,
	removeDirectory,
	accurateCoverPath
} = require('../utils/util');

// Global variable used
const parentDir = __dirname.replace('\\controllers', '\\');

//TODO: Top 10 books 的评判标准不够合理
exports.aliasTop10BooksMonthly = (req, res, next) => {
	req.query.limit = '10';
	req.query.sort = '-ratingsQuantity,-ratingsAverage';
	next();
};

// Do the dirty job to check if the upload file is legal
exports.checkUpload = catchAsync(async (req, res, next) => {
	if (!req.files || Object.keys(req.files).length === 0) {
		return next(new AppError('No file was uploaded.', 400));
	}
	if (req.files.file.truncated) {
		return next(new AppError('The file you uploaded is too big', 400));
	}
	// First time check if that book already exist(to avoid same name with the metadata title with the filename)
	const _path = path.join(
		__dirname.replace('\\controllers', '\\'),
		`${process.env.REPOSITORY}\\${req.files.file.name}`
	);
	const exist = await isFileExists(_path);
	if (exist) return next(new AppError('This book is already exist.', 400));
	next();
});

/**
 * 1.Save the book somewhere
 * 2.Parse the book and create a book document
 */
exports.uploadBook = catchAsync(async (req, res, next) => {
	const { file } = req.files;

	// Path to store the book
	const filePath = path.join(
		parentDir,
		`${process.env.REPOSITORY}\\${file.name}`
	);

	// Save the book file to filePath
	await promisify(file.mv)(filePath);

	// Get the metadata of the book
	const metadata = await getMetaData(filePath);

	// Check if we have the book already if true,return immediately
	const book = await Book.find({ title: metadata.title });
	if (book.length !== 0) {
		await deleteBook(filePath);
		return next(new AppError('我们书城已经有这本书啦', 400));
	}

	// Rename the epub file. Avoid name like 345&asd.epub
	const targetPath = path.join(
		parentDir,
		`${process.env.REPOSITORY}\\${metadata.title}.epub`
	);
	// Accurate the book name
	// 修改epub文件的名字，改成metadata里面的名字，原本可能是065432.epub这种
	await promisify(fs.rename)(filePath, targetPath);

	// 下面来提取epub的cover 因为依赖包提取不了(我晚些自己写个epub解析引擎，这个太慢了)
	const coverPath = await accurateCoverPath(
		targetPath,
		path.join(parentDir, '/public/cover/')
	);
	metadata.cover = path.join('\\cover\\', coverPath);

	// Unzip the file
	// const unzipPath = path.join(parentDir, `\\public\\books\\${metadata.title}`);
	// await extract(targetPath, { dir: unzipPath });

	// Create a book document
	metadata.filename = `${metadata.title}.epub`;

	await Book.create(metadata);

	// Send message to user first
	res.status(201).json({
		status: 'success',
		message: '上传成功！'
	});
});

exports.getAllBooks = factory.getAll(Book.find(), {
	select: '-verify'
});

exports.updateBook = factory.updateOne(Book);
exports.getBook = factory.getOne(Book, { path: 'reviews' });
//TODO: Relative review need to be deleted.
exports.deleteBook = catchAsync(async (req, res, next) => {
	const book = await Book.findByIdAndDelete(req.params.id);
	if (!book) return next(new AppError('No book found with that ID.', 404));

	// Delete those two book relative data
	const epubPath = path.join(
		parentDir,
		`${process.env.REPOSITORY}\\${book.title}.epub`
	);
	const unzipPath = path.join(parentDir, `\\public\\books\\${book.title}`);
	console.log(unzipPath);
	await deleteBook(epubPath);
	await removeDirectory(unzipPath);

	// Delete relative review

	res.status(204).json({
		status: 'success',
		data: null
	});
});

//*************************** *//
//******* My API PART ******* *//
//*************************** *//
exports.getNumTotalBooks = catchAsync(async (req, res) => {
	const numTotalBook = await Book.countDocuments();
	res.status(200).json({
		status: 'success',
		data: {
			count: numTotalBook
		}
	});
});

exports.downloadBook = catchAsync(async (req, res, next) => {
	const result = await DownloadLog.findOne({
		user: req.user.id,
		book: req.params.id
	});
	if (!result) {
		await DownloadLog.create({
			user: req.user.id,
			book: req.params.id,
			createdAt: Date.now()
		});
	}
	const book = await Book.findById(req.params.id);
	const filePath = path.join(
		parentDir,
		`${process.env.REPOSITORY}`,
		book.filename
	);
	res.sendFile(filePath);
});

exports.sendBook = catchAsync(async (req, res, next) => {
	const book = await Book.findById(req.params.id);
	const filePath = path.join(parentDir, book.location);
	res.download(filePath);
});
