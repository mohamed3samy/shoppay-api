const router = require('express').Router();

const {
	getUserValidator,
	createUserValidator,
	updateUserValidator,
	deleteUserValidator,
	changeUserPasswordValidator,
	updateLoggedUserValidator,
} = require('../utils/validators/userValidator');
const {
	getUsers,
	createUser,
	getUser,
	updateUser,
	deleteUser,
	uploadUserImage,
	resizeImage,
	changeUserPassword,
	getLoggedUserData,
	changeLoggedUserPassword,
	updateLoggedUserData,
	deactivateLoggedUser,
} = require('../services/userService');
const { protect, allowedTo } = require('../services/authService');

router.use(protect);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', changeLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deactivateLoggedUser);

// Admin
router.use(allowedTo('admin', 'manager'));
router.put(
	'/changePassword/:id',
	changeUserPasswordValidator,
	changeUserPassword
);
router
	.route('/')
	.get(getUsers)
	.post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
	.route('/:id')
	.get(getUserValidator, getUser)
	.put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
	.delete(deleteUserValidator, deleteUser);

module.exports = router;
