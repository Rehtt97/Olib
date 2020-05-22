const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError('No document found with that ID.', 404));
		}
		res.status(200).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id, { active: false });

		if (!doc) return next(new AppError('No document found with that ID.', 404));

		res.status(204).json({
			status: 'success',
			data: null
		});
	});

exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		if (!doc) {
			return next(new AppError('No document found with that ID.', 404));
		}
		res.status(200).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getAll = (Model, queryOption) =>
	catchAsync(async (req, res, next) => {
		// Allow nest route for getting reviews
		let filterObj = {};
		if (req.params.bookId) filterObj = { book: req.params.bookId };

		// EXECUTE THE QUERY
		const features = new APIFeatures(Model.find(filterObj), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const doc = await features.query.select(queryOption.select);

		// SEND RESPONSE
		res.status(200).json({
			status: 'success',
			data: {
				results: doc.length,
				data: {
					data: doc
				}
			}
		});
	});
