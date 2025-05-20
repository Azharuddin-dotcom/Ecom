import React, { useContext, useState } from 'react';
import { GlobalState } from '../../../GlobalState';
import axios from 'axios';
import './categories.css';

function Categories() {
  const state = useContext(GlobalState);
  const [categories, setCategories] = state.categoriesAPI.categories;
  const [token] = state.token;

  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [id, setId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/category/${id}`, { name }, {
          headers: { Authorization: token }
        });
        alert('Category updated');
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/category`, { name }, {
          headers: { Authorization: token }
        });
        alert('Category created');
      }

      setName('');
      setEditing(false);
      setId('');

      // Refresh categories
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/category`);
      setCategories(res.data.categories);

    } catch (err) {
      alert(err.response?.data?.msg || 'Error occurred');
    }
  };

  const editCategory = (id, name) => {
    setId(id);
    setName(name);
    setEditing(true);
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/category/${id}`, {
          headers: { Authorization: token }
        });

        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/category`);
        setCategories(res.data.categories);
        alert('Category deleted');
      } catch (err) {
        alert(err.response?.data?.msg || 'Delete failed');
      }
    }
  };

  return (
    <div className="category-page">
      <h2 className="category-title">{editing ? 'Edit' : 'Create'} Category</h2>

      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          value={name}
          required
          placeholder="Category name"
          onChange={(e) => setName(e.target.value)}
          className="category-input"
        />
        <button type="submit" className="category-submit-btn">
          {editing ? 'Update' : 'Create'}
        </button>
      </form>

      <ul className="category-list">
        {categories.map(category => (
          <li key={category._id} className="category-item">
            <span className="category-name">{category.name}</span>
            <div className="category-actions">
              <button
                onClick={() => editCategory(category._id, category.name)}
                className="category-edit-btn"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(category._id)}
                className="category-delete-btn"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;
