import React from "react";
import BtnRender from "./BtnRender";


const ProductList = ({ product, isAdmin, handleCheck }) => {

  // console.log(product);

  return (
    <div className="product_card">
      {
        isAdmin && <input type="checkbox" checked={product.checked} onChange={() => handleCheck(product._id)} />
      }
      <img src={product.images.url} alt="img" />

      <div className="product_box">
        <h2 title={product.title}>{product.title}</h2>
        <span>${product.price}</span>
        <p>{product.description}</p>
      </div>

      <BtnRender product={product} />
    </div>
  );
};

export default ProductList;
