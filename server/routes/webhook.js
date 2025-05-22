require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

// ✅ This route uses express.raw directly
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        const order = await Order.findByIdAndUpdate(
          session.metadata.orderId,
          {
            status: "confirmed",
            session_id: session.id,
          },
          { new: true }
        );

        if (!order) {
          console.error("Order not found:", session.metadata.orderId);
        } else {
          console.log("✅ Order confirmed:", order._id);
        }

        await User.findByIdAndUpdate(session.metadata.userId, {
          $set: { cart: [] },
        });

        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { sold: item.quantity },
          });
        }

        console.log("Order confirmed:", order._id);
      } catch (err) {
        console.error("Order update error:", err.message);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
