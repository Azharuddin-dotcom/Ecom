import React, { useContext, useEffect, useState } from "react";
import { GlobalState } from "../../../GlobalState";
import ProductList from "../utils/ProductLists/ProductList";
import axios from "../utils/axios.js";
import "./products.css";

const Product = () => {
  const state = useContext(GlobalState);
  const [isAdmin] = state.userAPI.isAdmin;
  const [token] = state.token;
  const [categories] = state.categoriesAPI.categories;

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Filters and pagination
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Selection for bulk delete
  const [isCheckAll, setIsCheckAll] = useState(false);

  const handleCheck = (id) => {
    const updatedProducts = products.map((product) =>
      product._id === id ? { ...product, checked: !product.checked } : product
    );
    setProducts(updatedProducts);
  };

  const handleCheckAll = () => {
    const updated = products.map((product) => ({
      ...product,
      checked: !isCheckAll,
    }));
    setProducts(updated);
    setIsCheckAll(!isCheckAll);
  };

  const deleteSelectedProducts = async () => {
    const selected = products.filter((product) => product.checked);
    if (selected.length === 0) return alert("No products selected.");

    if (!window.confirm("Are you sure you want to delete selected products?"))
      return;

    try {
      await Promise.all(
        selected.map((product) =>
          axios.delete(`/api/products/${product._id}`, {
            headers: { Authorization: token },
          })
        )
      );

      alert("Selected products deleted.");
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed.");
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {
        page,
        limit,
        sort: `${order === "desc" ? "-" : ""}${sort}`,
        ...(category && { category }), // Sends _id now
        ...(minPrice && { "price[gte]": minPrice }),
        ...(maxPrice && { "price[lte]": maxPrice }),
      };

      const res = await axios.get(`/api/products`, { params });

      const updated = (res.data.products || res.data).map((p) => ({
        ...p,
        checked: false,
      }));

      setProducts(updated);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sort, order, page, minPrice, maxPrice]);

  return (
    <div className="product-page">
      {/* Filters */}
      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option value={cat.name} key={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
        </select>

        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {isAdmin && (
        <div className="bulk-actions">
          <input
            type="checkbox"
            checked={isCheckAll}
            onChange={handleCheckAll}
            className="check-all-box"
          />
          <span>Select All</span>
          <button onClick={deleteSelectedProducts} className="delete-all-btn">
            Delete Selected
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="products">
        {products.map((product) => (
          <ProductList
            key={product._id}
            product={product}
            isAdmin={isAdmin}
            handleCheck={handleCheck}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Product;
