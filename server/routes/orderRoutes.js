const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/orderModel");

// GET /api/order/lookup/:sessionId
router.get("/order/lookup/:sessionId", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ session_id: req.params.sessionId });
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json(order);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = router;