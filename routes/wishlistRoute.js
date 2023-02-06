const router = require('express').Router();

const {
	addProductToWishlist,
	removeProductFromWishlist,
	getLoggedUserWishlist,
} = require('../services/wishlistService');
const { protect, allowedTo } = require('../services/authService');

router.use(protect, allowedTo('user'));

router.route('/').post(addProductToWishlist).get(getLoggedUserWishlist);
router.delete('/:productId', removeProductFromWishlist);

module.exports = router;
