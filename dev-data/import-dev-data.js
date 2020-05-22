const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./../models/userModel');
const Book = require('./../models/bookModel');

dotenv.config({
  path: './../config.env'
});

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

// READ JSON FILE
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/user-mock-data.json`, 'utf-8')
);

const books = JSON.parse(
  fs.readFileSync(`${__dirname}/book-mock-data.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(users);
    await Book.create(books);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    console.log('Data successfully delete!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
