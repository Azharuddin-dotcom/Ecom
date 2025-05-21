require('dotenv').config();
const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.get('/orders', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const orders = await Order.find({ email: user.email })
      .sort({ created: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;