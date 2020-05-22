const sharp = require('sharp');
const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only image.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

	sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`);
};

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword instead.',
				400
			)
		);
	}

	// 2) Filtered out the unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'username', 'email');
	if (req.file) filteredBody.avatar = req.file.filename;

	// 3) Update user document
	const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		runValidators: true,
		new: true
	});
	res.status(200).json({
		status: 'success',
		data: {
			user
		}
	});
});
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		status: 'success',
		result: users.length,
		data: {
			users
		}
	});
});

// Do not update password with this function
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
