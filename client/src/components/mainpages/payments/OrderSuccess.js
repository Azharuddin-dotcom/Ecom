import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlobalState } from '../../../GlobalState';
import axios from '../utils/axios';
import Loading from '../utils/loading/Loading';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [, setCart] = state.userAPI.cart;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    if (!orderId) {
      setError('Missing order ID');
      setLoading(false);
      navigate('/');
      return;
    }

    const verifyOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/orders/order-success?orderId=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setOrder(res.data.order);
          // Clear cart
          const cartRes = await axios.get('/user/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCart(cartRes.data.cart || []);
        } else {
          throw new Error(res.data.error || 'Order verification failed');
        }
      } catch (err) {
        if (retryCount < maxRetries) {
          setTimeout(() => setRetryCount(c => c + 1), 2000);
        } else {
          setError(err.response?.data?.error || err.message || 'Order verification failed');
          console.error('Order verification error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [orderId, token, navigate, setCart, retryCount]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="error-container">
      <h2>Order Processing Issue</h2>
      <p>{error}</p>
      <div className="button-group">
        <button onClick={() => navigate('/order-history')}>
          View Order History
        </button>
        <button onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="checkmark">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="order-reference">Order #: {order?.id.slice(-8).toUpperCase()}</p>
        
        <div className="order-details">
          <h3>Order Summary</h3>
          <div className="detail-row">
            <span>Status:</span>
            <span className={`status-${order?.status}`}>
              {order?.status}
            </span>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <span>${order?.amount?.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Date:</span>
            <span>{new Date(order?.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="primary-btn"
            onClick={() => navigate(`/order/${order?.id}`)}
          >
            View Order Details
          </button>
          <button 
            className="secondary-btn"
            onClick={() => navigate('/order-history')}
          >
            Order History
          </button>
        </div>

        <button 
          className="continue-btn"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;