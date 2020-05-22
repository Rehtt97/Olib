const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, '请输入您的用户名'],
		trim: true
	},
	email: {
		type: String,
		lowercase: true,
		trim: true,
		unique: true,
		required: [true, '请输入邮箱地址'],
		validate: [validator.isEmail, '请输入合法的邮箱地址']
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, '请输入密码'],
		minlength: [8, '密码长度不能少于8位。'],
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, '请确认密码'],
		validate: {
			validator: function (val) {
				return val === this.password;
			},
			message: '两次输入的密码不一致。'
		}
	},
	motto: {
		type: String,
		trim: true
	},
	avatar: { type: String, default: 'default.png' },
	balance: {
		type: Number,
		default: 0
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetTokenExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false
	},
	bookList: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'BookList'
		}
	]
});

userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next();

	// Hash the password with the cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	// Delete the passwordConfirm field
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now() + 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

userSchema.methods.correctPassword = async (
	candidatePassword,
	userPassword
) => {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);
		return changedTimestamp > JWTTimestamp;
	}
	// False mean NOT changed
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
