const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');
const reviewRoute = require('./reviewRoutes');

const router = express.Router();

router.use('/:bookId/reviews/', reviewRoute);

router
	.route('/top-10-book-monthly')
	.get(bookController.aliasTop10BooksMonthly, bookController.getAllBooks);

// Get all the books and specific book
router.route('/').get(bookController.getAllBooks);
router.get('/numTotalBooks', bookController.getNumTotalBooks);
router.get('/:id', bookController.getBook);
router.get(
	'/:id/download',
	authController.protect,
	bookController.downloadBook
);
router.get('/:id/read', bookController.sendBook);

// Get total books count

router.post('/upload', bookController.checkUpload, bookController.uploadBook);
router.use(authController.protect);

router.use(authController.restrictTo('admin'));
router
	.route('/:id')
	.patch(bookController.updateBook)
	.delete(bookController.deleteBook);

module.exports = router;
