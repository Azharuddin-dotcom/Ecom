import React, { useState, useEffect } from 'react';
import axios from '../components/mainpages/utils/axios.js';

const CategoriesAPI = () => {
  const [categories, setCategories] = useState([]);
 
  const getCategories = async () => {
      try {
        const res = await axios.get(`/api/category`);
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
