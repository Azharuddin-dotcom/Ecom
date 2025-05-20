import React, { useState, useEffect } from 'react'
import axios from 'axios';

const ProductAPI = () => {

    const [products, setProducts] = useState([])

    const getProducts = async () => {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`)
        setProducts(res.data);
        // console.log(res.data);
    }

    useEffect(() => {
        getProducts()
    },[])

  return {
    products : [products,setProducts],
  }
}

export default ProductAPI;
