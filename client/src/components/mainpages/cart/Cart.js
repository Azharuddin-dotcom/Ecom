import React, { useContext } from 'react';
import { GlobalState } from '../../../GlobalState';
import { loadStripe } from '@stripe/stripe-js';
import { Link } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const Cart = () => {
  const state = useContext(GlobalState);
  const [cart, setCart] = state.userAPI.cart;
  const [token] = state.token;

  const removeFromCart = (id) => {
    const newCart = cart.filter(product => product._id !== id);
    setCart(newCart);
  };

  const increaseQty = (id) => {
    const updatedCart = cart.map(item =>
      item._id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    setCart(updatedCart);
  };

  const decreaseQty = (id) => {
    const updatedCart = cart.map(item =>
      item._id === id && (item.quantity || 1) > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCart(updatedCart);
  };

  const handleBuyNow = async () => {
    try {
      const stripe = await stripePromise;

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cart })
      });

      const session = await res.json();
      console.log('Stripe session response:', session);

      if (!res.ok) {
        throw new Error(session.error || 'Failed to create Stripe session');
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (err) {
      alert('Checkout Error: ' + err.message);
    }
  };

  const getTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <svg 
            className="empty-cart-icon" 
            width="120" 
            height="120" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2 className="empty-cart-title">Your Cart is Empty</h2>
          <p className="empty-cart-message">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const buttonLabel = cart.length === 1 ? 'Buy Now' : 'Buy All';

  return (
    <div className="cart-container">
      <h1 className="cart-title">Shopping Cart</h1>
      
      <div className="cart-items">
        {cart.map((product) => (
          <div className='cart-item' key={product._id}>
            <div className="cart-item-image">
              <img src={product.images.url} alt={product.title} />
            </div>
            <div className='cart-item-details'>
              <div className='cart-item-header'>
                <h2>{product.title}</h2>
                <h6>ID: {product.product_id}</h6>
              </div>
              <div className="cart-item-price">
                <span>${product.price}</span>
              </div>
              <p className="cart-item-description">{product.description}</p>
              
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn" 
                    onClick={() => decreaseQty(product._id)}
                  >
                    −
                  </button>
                  <span className="quantity-display">{product.quantity || 1}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={() => increaseQty(product._id)}
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total">
                  <p>Item Total: <strong>${(product.price * (product.quantity || 1)).toFixed(2)}</strong></p>
                </div>
                
                <button 
                  onClick={() => removeFromCart(product._id)} 
                  className='remove-btn'
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        <button 
          onClick={handleBuyNow} 
          className='checkout-btn'
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default Cart;