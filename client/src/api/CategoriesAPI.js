import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoriesAPI = () => {
  const [categories, setCategories] = useState([]);
 
  const getCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/category`);
        setCategories(res.data.categories);
        // console.log(res.data.categories);
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to load categories');
      }
    }
    
    useEffect(() => {
      getCategories();
    },[]);

  return {
    categories: [categories, setCategories],
  };
};

export default CategoriesAPI;
