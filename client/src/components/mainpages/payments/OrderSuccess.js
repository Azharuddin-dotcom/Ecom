import { useEffect, useState, useContext } from 'react';
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
        setError(err.response?.data?.error || err.message || 'Failed to verify order');
        console.error('Order verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [orderId, token, navigate, setCart]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="error-container">
      <h2>Order Processing Issue</h2>
      <p>{error.includes('404') ? 'Server endpoint not found' : error}</p>
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
      <div className="success-emoji">🎉</div>
      <h2>Thank you for your purchase!</h2>
      
      <div className="order-details">
        <p><span className="success-highlight">Order ID:</span> {order.id}</p>
        <p><span className="success-highlight">Status:</span> <span className="status-confirmed">{order.status}</span></p>
        <p><span className="success-highlight">Amount:</span> ₹{order.amount}</p>
      </div>
      
      <div className="button-group">
        <button onClick={() => navigate('/order-history')}>
          View Order History
        </button>
        <button onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
  );
};

export default OrderSuccess;