import React, { useContext, useState, useEffect, useRef } from 'react';
import { MdOutlineMenu, MdClose, MdOutlineAddShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";
import { GlobalState } from '../../GlobalState';
import axios from '../mainpages/utils/axios.js';
import './header.css';
const Header = () => {
  const state = useContext(GlobalState);
  const [isLogged, setIsLogged] = state.userAPI.isLogged;
  const [isAdmin, setIsAdmin] = state.userAPI.isAdmin;
  const [cart, setCart] = state.userAPI.cart;
  const [token] = state.token;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const logoutUser = async () => {
    try {
      await axios.patch(`/user/addcart`, { cart: [] }, {
        headers: { Authorization: token }
      });
      await axios.get(`/user/logout`);
      localStorage.clear();
      setIsAdmin(false);
      setIsLogged(false);
      setCart([]);
      setMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err.response?.data?.msg || err.message);
    }
  };

  const adminRouter = () => (
    <>
      <li><Link to="/create_product" onClick={() => setMenuOpen(false)}>Create Product</Link></li>
      <li><Link to="/category" onClick={() => setMenuOpen(false)}>Categories</Link></li>
    </>
  );

  const loggedRouter = () => (
    <>
      {!isAdmin && <li><Link to="/order-history" onClick={() => setMenuOpen(false)}>History</Link></li>}
      <li><Link to="/" onClick={() => { logoutUser(); setMenuOpen(false); }}>Logout</Link></li>
    </>
  );

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Auto-close on scroll
  useEffect(() => {
    const handleScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header>
      <div className='logo'>
        <h1>
          <Link to="/">{isAdmin ? 'Admin' : 'ECOM Shop'}</Link>
        </h1>
      </div>

      <div className='menu' onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <MdClose size={30} /> : <MdOutlineMenu size={30} />}
      </div>

      <ul ref={menuRef} className={menuOpen ? 'active' : ''}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>{isAdmin ? 'Products' : 'Shop'}</Link></li>
        {isAdmin && adminRouter()}
        {isLogged
          ? loggedRouter()
          : <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login or Register</Link></li>}
      </ul>

      {!isAdmin && (
        <div className='cart-icon'>
          <span>{cart.length}</span>
          <Link to='/cart'><MdOutlineAddShoppingCart size={30} /></Link>
        </div>
      )}
    </header>
  );
};


export default Header;
