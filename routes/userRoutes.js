const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
	'/updateMe',
	userController.uploadUserPhoto,
	userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.route('/updateMyPassword').patch(authController.updatePassword);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
