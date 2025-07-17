import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios.js";
import { GlobalState } from "../../../GlobalState";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/stripe/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load order details");
        setLoading(false);
      }
    };

    if (token) getOrderDetails();
  }, [token, id]);

  if (loading) return <div className="loading">Loading order details...</div>;

  if (error) return <div className="error">{error}</div>;

  if (!order) return <div className="error">Order not found</div>;

  // Format date for better readability
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Map status to color class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      default:
        return "";
    }
  };

  return (
    <div className="order-details">
      <div className="order-header">
        <h2>Order Details</h2>
        <Link to="/order-history" className="back-btn">
          Back to Orders
        </Link>
      </div>

      <div className="order-info">
        <div className="info-item">
          <span className="label">Order ID:</span>
          <span className="value">{order._id}</span>
        </div>
        <div className="info-item">
          <span className="label">Date:</span>
          <span className="value">{formatDate(order.createdAt)}</span>
        </div>
        <div className="info-item">
          <span className="label">Status:</span>
          <span className={`value status ${getStatusClass(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="info-item">
          <span className="label">Total Amount:</span>
          <span className="value price">${order.amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="order-products">
        <h3>Products</h3>
        <div className="products-list">
          {order.products &&
            order.products.map((item, index) => (
              <div className="product-item" key={index}>
                {(item.image || (item.images && item.images.url)) && (
                  <img
                    src={item.image || item.images.url}
                    alt={item.title}
                    className="product-image"
                  />
                )}
                <div className="product-details">
                  <h4>{item.title}</h4>
                  <div className="product-info">
                    <div className="info-row">
                      <span className="label">Price:</span>
                      <span className="value">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Quantity:</span>
                      <span className="value">{item.quantity}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Subtotal:</span>
                      <span className="value">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
