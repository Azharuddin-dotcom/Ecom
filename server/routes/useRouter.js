const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth.js')

const router = require('express').Router();

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/refresh_token', userCtrl.refreshtoken);
router.get('/infor',auth, userCtrl.getUser);
router.patch('/addcart', auth, userCtrl.addCart);
router.patch('/remove_from_cart', auth, userCtrl.removeFromCart);
router.get('/cart', auth, userCtrl.getCart);


module.exports = router