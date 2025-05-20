const router = require('express').Router();
const productCtrl = require('../controllers/productCtrl.js');

router.route('/products')
.get(productCtrl.getProducts)
.post(productCtrl.createProducts)



router.route('/products/:id')
.get(productCtrl.getProduct)
.delete(productCtrl.deleteProduct)
.put(productCtrl.updateProduct)


module.exports = router;