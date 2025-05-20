import React, { useState, useContext } from 'react';
import axios from '../utils/axios.js';
import { GlobalState } from '../../../GlobalState';
import './createProduct.css';

const CreateProductPage = () => {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [categories] = state.categoriesAPI.categories;
  console.log(categories);

  const [productData, setProductData] = useState({
    product_id: '',
    title: '',
    price: 0,
    description: '',
    content: '',
    category: '',
    images: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });

      setProductData({ ...productData, images: { url: res.data.url, public_id: res.data.public_id } });
    } catch (err) {
      alert('Image upload failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { product_id, title, price, description, content, images, category } = productData;

    if (!product_id || !title || !price || !description || !content || !images || !category) {
      return alert('Please fill in all required fields');
    }

    // ✅ Convert category ID to name
    const categoryName = categories.find(cat => cat._id === category)?.name;

    const productToSend = {
      ...productData,
      category: categoryName, // replace _id with name
    };

    try {
      const res = await axios.post(`/api/products`, productToSend, {
        headers: { Authorization: token },
      });

      alert(res.data.msg);

      setProductData({
        product_id: '',
        title: '',
        price: 0,
        description: '',
        content: '',
        category: '',
        images: null,
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to create product');
    }
  };

  return (
    <div className="create-product-page">
      <h2>Create New Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product ID</label>
          <input
            type="text"
            name="product_id"
            value={productData.product_id}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={productData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Content</label>
          <textarea
            name="content"
            value={productData.content}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Category</label>
          <select
            name="category"
            value={productData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
        </div>

        {loading && <p>Uploading image...</p>}

        {productData.images?.url && (
          <div>
            <p>Image Preview:</p>
            <img src={productData.images.url} alt="Product" width="150" />
          </div>
        )}

        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default CreateProductPage;
