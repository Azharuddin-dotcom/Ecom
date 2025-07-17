// Route: GET /api/orders/order-success?orderId=xyz
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

router.get("/orders/order-success", auth, async (req, res) => {
  const { orderId } = req.query;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      error: "Valid order ID is required"
    });
  }

  try {
    const order = await Order.findById(orderId).populate("products.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        amount: order.amount,
        status: order.status,
        products: order.products,
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    console.error("Order verification error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify order"
    });
  }
});

module.exports = router;
