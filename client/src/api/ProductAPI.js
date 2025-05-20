import React, { useState, useEffect } from 'react'
import axios from '../components/mainpages/utils/axios.js';

const ProductAPI = () => {

    const [products, setProducts] = useState([])

    const getProducts = async () => {
        const res = await axios.get(`/api/products`)
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
