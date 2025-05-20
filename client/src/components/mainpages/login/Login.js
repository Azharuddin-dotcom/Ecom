import React, { useState }from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';

const Login = () => {

  const [user, setUser] = useState({
    email: '',
    password: ''
  })

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const loginSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/login`, {...user})

      localStorage.setItem('firstLogin', true)

      window.location.href = '/'

    } catch (err) {
      alert(err.response.data.msg);       
    }
  }

  return (
    <div className='login-page'>
      <form onSubmit={loginSubmit}>
        <input type='email' name='email' placeholder='Email' value={user.email} onChange={onChangeInput} required />
        <input type='password' name='password' placeholder='Password' value={user.password} onChange={onChangeInput} required />

        <div className='row'>
          <button type='submit'>Login</button>
          <Link to='/register'>Register</Link>
        </div>
        
      </form>
    </div>
  )
}

export default Login;
