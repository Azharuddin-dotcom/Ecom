import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { GlobalState } from "../../../GlobalState";
import "./OrderSuccess.css";
import axios from "../utils/axios.js";

const OrderSuccess = () => {
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get("session_id");

  const state = useContext(GlobalState);
  const [cart, setCart] = state.userAPI.cart;
  const [token] = state.token;

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("/user/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCart(res.data.cart || []);
      } catch (err) {
        console.error("Failed to fetch updated cart:", err);
      }
    };

    const fetchOrder = async () => {
      if (!sessionId) return;
      try {
        const res = await axios.get(`/api/order/lookup/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrderId(res.data._id);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      }
    };

    fetchCart();
    fetchOrder();
  }, [token, setCart, sessionId]);

  return (
    <div className="order-success">
      <div className="success-container">
        <div className="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Your Order Was Successful!</h1>
        <p>
          Thank you for your purchase. Your order has been placed and is being
          processed.
        </p>
        <p className="order-id">
          Order ID: <span>{orderId || "Loading..."}</span>
        </p>
        <div className="action-buttons">
          {orderId && (
            <Link to={`/order/${orderId}`} className="view-order-btn">
              View Order Details
            </Link>
          )}
          <Link to="/order-history" className="view-history-btn">
            View Order History
          </Link>
        </div>
        <Link to="/" className="continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
