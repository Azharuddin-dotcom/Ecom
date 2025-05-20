import React, { useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlobalState } from '../../../GlobalState';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get('orderId');

  const state = useContext(GlobalState);
  const [setCart] = state.userAPI.cart;
  const [token] = state.token;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCart(data.cart || []);
      } catch (err) {
        console.error('Failed to fetch updated cart:', err);
      }
    };

    fetchCart();
  }, [token, setCart]);

  return (
    <div className="order-success">
      <div className="success-container">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </div>
    </div>
  );
};

export default OrderSuccess;
