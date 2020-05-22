class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		// BUG An unknown bug bypass by nextline
		//下面这行绕开了 Mongoose使用正则的某个 奇怪的bug 未能解决
		this.query._conditions = {};

		// Basic Filtering
		let queryObj = { ...this.queryString };

		// Filter invalid field
		const excludedFields = ['page', 'sort', 'limit', 'fields', 'like'];
		excludedFields.forEach((el) => delete queryObj[el]);

		// Advancing filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

		queryObj = JSON.parse(queryStr);
		console.log(this.queryString);
		// 模糊查询 只允许使用BookRoute使用like参数不然报错因为reviews没有title和author
		if (this.queryString.like) {
			if (queryObj.title) queryObj.title = new RegExp(queryObj.title);
			if (queryObj.author) queryObj.author = new RegExp(queryObj.author);
		}
		this.query = this.query.find(queryObj);
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		}
		return this;
	}

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}

	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 30;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

module.exports = APIFeatures;
