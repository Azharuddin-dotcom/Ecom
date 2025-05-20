import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'


import './registerStyles.css';

const Register = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const registerSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {

    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/register`, { ...user });

    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/login`, {
      email: user.email,
      password: user.password
    });

    await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/refresh_token`); 

    localStorage.setItem('firstLogin', true);
    window.location.href = '/';
  } catch (err) {
    setError(err.response?.data?.msg || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header Section */}
        <div className="register-header">
          <h2>Create an Account</h2>
          <p>Join our community today</p>
        </div>
        
        {/* Form Container */}
        <div className="register-form-container">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={registerSubmit}>
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-group">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={user.name}
                  onChange={onChangeInput}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={user.email}
                  onChange={onChangeInput}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={user.password}
                  onChange={onChangeInput}
                  placeholder="••••••••"
                  required
                />
              </div>
              <span className="form-text">Must be at least 8 characters</span>
            </div>
            
            {/* Register Button */}
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : 'Register'}
            </button>
          </form>
          
          {/* Divider */}
          <div className="divider">
            <span>Or</span>
          </div>
          
          {/* Social Login Buttons */}
          <div className="social-buttons">
            <button type="button" className="btn-social btn-facebook">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
            <button type="button" className="btn-social btn-google">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Google
            </button>
          </div>
          
          {/* Login Link */}
          <div className="login-link">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;