// rafce then tab to create a functional component -

import React, { useContext } from 'react'
import { MdOutlineMenu } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";
import { GlobalState } from '../../GlobalState';
import axios from '../mainpages/utils/axios.js';

const Header = () => {

    const state = useContext(GlobalState);

    // console.log(state);

    const [isLogged, setIsLogged] = state.userAPI.isLogged;
    const [isAdmin, setIsAdmin] = state.userAPI.isAdmin;
    const [cart, setCart] = state.userAPI.cart;
    const [token] = state.token;

    const logoutUser = async () => {
    try {
        // 1. Clear cart on server
        await axios.patch(`/user/addcart`, { cart: [] }, {
            headers: { Authorization: token }
        });

        // 2. Log out from server
        await axios.get(`/user/logout`);

        // 3. Clear local state
        localStorage.clear();
        setIsAdmin(false);
        setIsLogged(false);
        setCart([]);
    } catch (err) {
        console.error('Logout error:', err.response?.data?.msg || err.message);
    }
};

    const adminRouter = () => {
        return (
            <>
                <li><Link to="/create_product">Create Product</Link></li>
                <li><Link to="/category">Categories</Link></li>
            </>
        )
    }

    const loggedRouter = () => {
        return (
            <>
                {!isAdmin && <li><Link to="/order-history">History</Link></li>}
                <li><Link to="/" onClick={logoutUser}>Logout</Link></li>
            </>
        )
    }

  return (
    <header>

        <div className='menu'>
            <MdOutlineMenu size={30} />
        </div>

        <div className='logo'>
            <h1>
                <Link to="/">{isAdmin?'Admin':'ECOM Shop'}</Link>
            </h1>
        </div>

        <ul>
            <li><Link to="/">{isAdmin?'Products':'Shop'}</Link></li>

            {isAdmin && adminRouter()}
            {
                isLogged ? loggedRouter() : <li><Link to="/login">Login or Register</Link></li>
            }
            
            <li>
                <MdClose size={30} className='menu'/>
            </li>
        </ul>

        {
            isAdmin ? '' : <div className='cart-icon'><span>{cart.length}</span><Link to='/cart'><MdOutlineAddShoppingCart size={30} /></Link></div>
        }

    </header>
  )
}

export default Header
