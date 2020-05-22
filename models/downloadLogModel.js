const mongoose = require('mongoose');

const downlodLogModelSchema = new mongoose.Schema(
	{
		createdAt: {
			type: Date,
			default: Date.now
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, '下载由用户触发！']
		},
		book: {
			type: mongoose.Schema.ObjectId,
			ref: 'Book',
			required: [true, '下载的对象是书籍！']
		},
		cost: {
			tpye: Number,
			default: 0
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

const DownlodLog = mongoose.model('DownlodLog', downlodLogModelSchema);
module.exports = DownlodLog;
