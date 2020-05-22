const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
// router.get('/book/:id', viewController.getBook);
// router.get('/book/read/:id', viewController.readBook);
router.get('/up', viewController.test);
router.get('/login', viewController.getLoginForm);
module.exports = router;
