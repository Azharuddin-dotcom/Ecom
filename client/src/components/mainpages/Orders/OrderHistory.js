import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axios.js';
import { Link } from 'react-router-dom';
import { GlobalState } from '../../../GlobalState';
import './OrderHistory.css';

const OrderHistory = () => {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/stripe/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load order history');
        setLoading(false);
      }
    };

    if (token) getOrders();
  }, [token]);

  if (loading) return <div className="loading">Loading order history...</div>;
  
  if (error) return <div className="error">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="order-history">
        <h2>Order History</h2>
        <p className="no-orders">You have no order history yet.</p>
        <Link to="/" className="shop-button">Shop Now</Link>
      </div>
    );
  }

  // Format date for better readability
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Map status to appropriate styling class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="order-history">
      <h2>Order History</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id.substring(0, 8)}...</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>${order.amount.toFixed(2)}</td>
              <td>
                <span className={`status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td>
                <Link to={`/order/${order._id}`} className="view-btn">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;