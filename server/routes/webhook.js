require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
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
    const dbSession = await mongoose.startSession();
    
    try {
      await dbSession.startTransaction();
      
      // Update order
      const order = await Order.findByIdAndUpdate(
        session.metadata.orderId,
        { status: "confirmed", session_id: session.id },
        { new: true, session: dbSession }
      );

      // Clear user cart
      await User.findByIdAndUpdate(
        session.metadata.userId,
        { $set: { cart: [] } },
        { session: dbSession }
      );

      // Update product stocks
      await Promise.all(
        order.products.map(item => 
          Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity, sold: item.quantity } },
            { session: dbSession }
          )
        )
      );

      await dbSession.commitTransaction();
    } catch (err) {
      await dbSession.abortTransaction();
      console.error("Webhook processing failed:", err);
    } finally {
      dbSession.endSession();
    }
  }

  res.json({ received: true });
});


module.exports = router;
