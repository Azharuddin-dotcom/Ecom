import { useState, useEffect } from "react";
import axios from '../components/mainpages/utils/axios.js';

const UserAPI = (token) => {
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (token) {
      const getUser = async () => {
        try {
          const res = await axios.get(`/user/infor`, {
            headers: { Authorization: token },
          });

          setIsLogged(true);
          setEmail(res.data.email);
          setCart(res.data.cart || []);
          res.data.role === 1 ? setIsAdmin(true) : setIsAdmin(false);
        } catch (err) {
          alert(err.response?.data?.msg || "Failed to fetch user info");
        }
      };
      getUser();
    }
  }, [token]);

  const addCart = async (product, quantity = 1) => {
    if (!isLogged) {
      return alert("PLEASE LOGIN OR REGISTER TO CONTINUE SHOPPING");
    }

    const existingItem = cart.find((item) => item._id === product._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }

    setCart(newCart);

    try {
      await axios.patch(
        `/user/addcart`,
        { cart: newCart },
        {
          headers: { Authorization: token },
        }
      );
    } catch (err) {
      alert("Failed to update cart: " + (err.response?.data?.msg || err.message));
    }
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter((item) => item._id !== productId);
    setCart(newCart);

    try {
      await axios.patch(
        `/user/addcart`,
        { cart: newCart },
        {
          headers: { Authorization: token },
        }
      );
    } catch (err) {
      alert("Failed to update cart: " + (err.response?.data?.msg || err.message));
    }
  };

  return {
    isLogged: [isLogged, setIsLogged],
    isAdmin: [isAdmin, setIsAdmin],
    cart: [cart, setCart],
    email,
    addCart,
    removeFromCart,
  };
};

export default UserAPI;
