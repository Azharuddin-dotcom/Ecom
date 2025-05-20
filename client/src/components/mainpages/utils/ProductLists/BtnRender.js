import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import { GlobalState } from '../../../../GlobalState';
import axios from 'axios';

const BtnRender = ({ product }) => {
  const state = useContext(GlobalState);
  const [isAdmin] = state.userAPI.isAdmin;
  const addCart = state.userAPI.addCart;
  const [token] = state.token;

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/products/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Product deleted successfully!");
      window.location.href = '/';
    } catch (err) {
      alert(err.response.data.msg);
    }
  };

  return (
    <div className="row_btn">
      {
        isAdmin ?
        <>
          <Link id='btn_buy' to={`/`} onClick={handleDelete}>
            Delete
          </Link>
          <Link id='btn_view' to={`detail/${product._id}`}>
            Edit
          </Link>
        </> :
        <>
          <Link id='btn_buy' to={`cart`} onClick={() => addCart(product)}>
            Buy
          </Link>
          <Link id='btn_view' to={`detail/${product._id}`}>
            View
          </Link>
        </>
      }
    </div>
  );
};

export default BtnRender;
