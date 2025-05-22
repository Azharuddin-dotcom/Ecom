import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlobalState } from '../../../GlobalState';
import axios from '../utils/axios.js';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get('orderId');

  const state = useContext(GlobalState);
  const [cart, setCart] = state.userAPI.cart;
  const [token] = state.token;

  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        const res = await axios.get(`/api/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.status === 'confirmed') {
          setConfirmed(true);

          // Refresh cart
          const cartRes = await axios.get('/user/cart', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setCart(cartRes.data.cart || []);
        } else {
          // Retry after delay if not confirmed yet
          setTimeout(checkOrderStatus, 2000);
        }
      } catch (err) {
        console.error(' Failed to check order status:', err.message);
      }
    };

    if (orderId) {
      checkOrderStatus();
    }
  }, [orderId, token, setCart]);

  return (
    <div className="order-success">
      <div className="success-container">
        {confirmed ? (
          <>
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1>Your Order Was Successful!</h1>
            <p>Thank you for your purchase. Your order has been placed and is being processed.</p>
            <p className="order-id">
              Order ID: <span>{orderId}</span>
            </p>
            <div className="action-buttons">
              <Link to={`/order/${orderId}`} className="view-order-btn">
                View Order Details
              </Link>
              <Link to="/order-history" className="view-history-btn">
                View Order History
              </Link>
            </div>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </>
        ) : (
          <div className="loading">
            <p>Processing your order...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
