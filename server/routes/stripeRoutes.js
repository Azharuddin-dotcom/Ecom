require("dotenv").config();

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const auth = require("../middleware/auth");

// Create checkout session - protected by auth middleware
router.post("/create-checkout-session", auth, async (req, res) => {
  const { cart } = req.body;
  // console.log("Cart:", cart);

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "Cart is empty or invalid" });
  }

  try {
    // Get user from auth middleware
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json({ error: "User not found" });

    // Validate and fetch products from DB
    const validatedProducts = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findById(item._id);
        if (!product) throw new Error(`Product not found: ${item._id}`);
        return {
          product,
          quantity: item.quantity || 1,
        };
      })
    );

    // Calculate total amount
    const amount = validatedProducts.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    // Create order with status pending
    const order = await Order.create({
      user: user._id,
      amount,
      products: validatedProducts.map((item) => ({
        product: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        images: item.product.images,
      })),
      status: "pending",
    });

    const lineItems = validatedProducts.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.title,
          description: item.product.description,
          // Adding product image if available
          images: item.product.images.url ? [item.product.images.url] : [],
        },
        unit_amount: Math.round(item.product.price * 100), // convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-success?orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Checkout session failed" });
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

    res.json({ status: order.status });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch order details" });
  }
});

// router.get("/order-success", async (req, res) => {
//   try {
//     const { orderId } = req.query;

//     if (!orderId) {
//       return res.status(400).send("Order ID is required");
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { status: "confirmed" },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).send("Order not found");
//     }

//     res.send(`
//         <html>
//           <head><title>Order Success</title></head>
//           <body>
//             <h1>Thank you for your order!</h1>
//             <p>Your order (${orderId}) has been successfully processed.</p>
//             <a href="/">Return to homepage</a>
//           </body>
//         </html>
//       `);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

module.exports = router;
