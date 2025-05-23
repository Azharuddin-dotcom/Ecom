require("dotenv").config();

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const { URL } = require("url");

// Create checkout session - protected by auth middleware
router.post("/create-checkout-session", auth, async (req, res) => {
  try {
    const { cart } = req.body;

    // Validate cart
    if (!cart?.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Validate CLIENT_URL
    if (!process.env.CLIENT_URL) {
      throw new Error("CLIENT_URL is not configured");
    }
    new URL(process.env.CLIENT_URL); // Validate URL format

    // Get user and validate products
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const validatedProducts = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findById(item._id);
        if (!product) throw new Error(`Product ${item._id} not found`);
        if (product.stock < (item.quantity || 1)) {
          throw new Error(`Not enough stock for ${product.title}`);
        }
        return { product, quantity: item.quantity || 1 };
      })
    );

    // Create order
    const order = await Order.create({
      user: user._id,
      amount: validatedProducts.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
      products: validatedProducts.map(item => ({
        product: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.url
      })),
      status: "pending"
    });

    // Create Stripe session
    const successUrl = new URL("/order-success", process.env.CLIENT_URL);
    successUrl.searchParams.append("orderId", order._id.toString());

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: validatedProducts.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.title,
            description: item.product.description.slice(0, 300),
            images: item.product.images?.url ? [item.product.images.url] : []
          },
          unit_amount: Math.round(item.product.price * 100)
        },
        quantity: item.quantity
      })),
      mode: "payment",
      success_url: successUrl.toString(),
      cancel_url: new URL("/cart", process.env.CLIENT_URL).toString(),
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString()
      }
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook handler to process successful payments
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     console.log("Webhook received");
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error("Webhook Error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       try {
//         // Update order status to completed
//         const order = await Order.findByIdAndUpdate(
//           session.metadata.orderId,
//           {
//             status: "confirmed",
//             session_id: session.id
//           },
//           { new: true }
//         );

//         // Clear user's cart after order completion
//         await User.findByIdAndUpdate(session.metadata.userId, {
//           $set: { cart: [] },
//         });

//         // Increment sold count on each product
//         for (const item of order.products) {
//           await Product.findByIdAndUpdate(item.product, {
//             $inc: { sold: item.quantity },
//           });
//         }
//       } catch (err) {
//         console.error("Order completion error:", err);
//       }
//     }

//     res.json({ received: true });
//   }
// );

// Get all orders for a user
router.get("/history", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort("-createdAt");

    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch order history" });
  }
});

// Get specific order details
router.get("/order/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch order details" });
  }
});

router.get("/order-success", auth, async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false,
        error: "Valid order ID is required" 
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    }).populate("products.product");

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
