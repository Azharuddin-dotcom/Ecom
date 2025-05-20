import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GlobalState } from "../../../../GlobalState";
import axios from "axios";

const DetailProduct = () => {
  const params = useParams();
  const state = useContext(GlobalState);

  const [productsData, setProductsData] = state.productsAPI.products;
  const products = productsData?.products || [];
  
  const [categories] = state.categoriesAPI.categories || [];
  const [isAdmin] = state.userAPI.isAdmin;
  const [token] = state.token;
  const addCart = state.userAPI.addCart;

  const [detailProduct, setDetailProduct] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    content: "",
    category: "",
    images: {},
  });

  useEffect(() => {
    if (params?.id) {
      // First try to find the product in the current products list
      const productFromList = products.find((p) => p._id === params.id);
      
      if (productFromList) {
        // Product found in current pagination results
        setDetailProduct(productFromList);
        setFormData({
          title: productFromList.title,
          price: productFromList.price,
          description: productFromList.description,
          content: productFromList.content,
          category: productFromList.category,
          images: productFromList.images,
        });
      } else {
        // Product not found in current page, fetch it directly
        const getProductById = async () => {
          try {
            setLoading(true);
            // Using the new endpoint we just created to fetch a single product
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/${params.id}`);
            const fetchedProduct = response.data;
            
            if (!fetchedProduct) {
              throw new Error("Product not found");
            }
            
            setDetailProduct(fetchedProduct);
            setFormData({
              title: fetchedProduct.title,
              price: fetchedProduct.price,
              description: fetchedProduct.description,
              content: fetchedProduct.content,
              category: fetchedProduct.category,
              images: fetchedProduct.images,
            });
          } catch (error) {
            console.error("Failed to fetch product details:", error);
            alert("Could not load product details");
          } finally {
            setLoading(false);
          }
        };
        
        getProductById();
      }
    }
  }, [params.id, products]);

  if (loading) return <div>Loading product details...</div>;
  if (!detailProduct || !detailProduct._id) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      if (!file) return alert("File not selected.");

      const formImg = new FormData();
      formImg.append("image", file);

      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, formImg, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: token,
        },
      });
      console.log("Uploaded image response:", res.data);
      setFormData((prev) => ({ ...prev, images: res.data }));
    } catch (err) {
      alert(err.response?.data?.msg || "Image upload failed.");
    }
  };

  const handleUpdate = async () => {
    try {
      const categoryName =
        categories.find((c) => c._id === formData.category)?.name ||
        formData.category;

      const updatedForm = {
        ...formData,
        category: categoryName,
      };

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/products/${detailProduct._id}`, updatedForm, {
        headers: {
          Authorization: token,
        },
      });

      alert("Product updated successfully!");

      // Update detail product state
      setDetailProduct((prev) => ({ ...prev, ...updatedForm }));
      
      // Update product in the products list if it exists there
      if (products.some(p => p._id === detailProduct._id)) {
        setProductsData((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p._id === detailProduct._id ? { ...p, ...updatedForm } : p
          ),
        }));
      }

      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed.");
    }
  };

  return (
    <div className="detail">
      <div>
        {formData.images?.url ? (
          <img src={formData.images.url} alt="product" />
        ) : (
          <div>No image available</div>
        )}
        {editMode && <input type="file" onChange={handleImageUpload} />}
      </div>

      <div className="box-detail">
        <div className="row">
          {editMode ? (
            <>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              <input type="text" value={detailProduct.product_id} disabled />
            </>
          ) : (
            <>
              <h2>{detailProduct.title}</h2>
              <h6>{detailProduct.product_id}</h6>
            </>
          )}
        </div>

        {editMode ? (
          <>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <span>${detailProduct.price}</span>
            <p>{detailProduct.description}</p>
            <p>{detailProduct.content}</p>
            <p>Category: {detailProduct.category}</p>
          </>
        )}

        <p>Sold: {detailProduct.sold}</p>

        {!isAdmin && (
          <div style={{ marginTop: "1rem" }}>
            <label>
              Quantity:
              <input
                type="number"
                value={quantity}
                min="1"
                style={{ width: "60px", marginLeft: "0.5rem" }}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <button
              onClick={() => addCart(detailProduct, quantity)}
              style={{ marginLeft: "1rem" }}
            >
              Add to Cart
            </button>
          </div>
        )}

        {isAdmin &&
          (editMode ? (
            <>
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)}>Edit Product</button>
          ))}
      </div>
    </div>
  );
};

export default DetailProduct;