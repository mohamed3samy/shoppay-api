const router = require('express').Router();

const {
	addAddress,
	removeAddress,
	getLoggedUserAddresses,
} = require('../services/addressService');
const { protect, allowedTo } = require('../services/authService');

router.use(protect, allowedTo('user'));

router.route('/').post(addAddress).get(getLoggedUserAddresses);
router.delete('/:addressId', removeAddress);

module.exports = router;
