const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Deal with uncaughtException
process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! ########## Shutting down!!!');
	console.log(err);
	process.exit(1);
});

dotenv.config({
	path: './config.env'
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	})
	.then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Server listening on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! ########## Shutting down!!!');
	console.log(err);
	server.close(() => process.exit(1));
});
