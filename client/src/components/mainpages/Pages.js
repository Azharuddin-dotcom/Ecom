import React from 'react'
import Product from './products/Product.js'
import Login from './login/Login'
import Register from './login/Register'
import Cart from './cart/Cart'
import { Routes, Route } from 'react-router-dom'
import DetailProduct from './utils/DetailProducts/DetailProduct.js'
import CreateProductPage from './products/CreateProductPage.js'
import Categories from './categories/categories.js'
import OrderHistory from './Orders/OrderHistory.js'
import OrderDetails from './Orders/OrderDetails.js'
import OrderSuccess from './payments/OrderSuccess.js'


const Pages = () => {
  return (
    <Routes>
      <Route path='/' element={<Product />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/detail/:id' element={<DetailProduct />} />
      <Route path='/create_product' element={<CreateProductPage />} />
      <Route path='/category' element={<Categories />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/order/:id" element={<OrderDetails />} />
      <Route path="/order-success" element={<OrderSuccess />} />
    </Routes>
  )
}

export default Pages
