require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

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

    res.json({ received: true }); // respond to Stripe ASAP

    if (event.type === "checkout.session.completed") {
      const sessionData = event.data.object;

      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      try {
        const order = await Order.findById(sessionData.metadata.orderId).session(dbSession);

        if (!order) {
          console.error("❌ Order not found:", sessionData.metadata.orderId);
          await dbSession.abortTransaction();
          return;
        }

        if (order.status === "confirmed") {
          console.log("⚠️ Order already confirmed:", order._id);
          await dbSession.abortTransaction();
          return;
        }

        // Update order
        order.status = "confirmed";
        order.session_id = sessionData.id;
        await order.save();

        // Clear user cart
        await User.findByIdAndUpdate(
          sessionData.metadata.userId,
          { $set: { cart: [] } },
          { session: dbSession }
        );

        // Update product sold count
        await Promise.all(
          order.products.map((item) =>
            Product.findByIdAndUpdate(
              item.product,
              { $inc: { sold: item.quantity } },
              { session: dbSession }
            )
          )
        );

        await dbSession.commitTransaction();
        console.log("✅ Order processed successfully:", order._id);
      } catch (err) {
        await dbSession.abortTransaction();
        console.error("🔥 Transaction failed:", err.message);
      } finally {
        dbSession.endSession();
      }
    }
  }
);

module.exports = router;
