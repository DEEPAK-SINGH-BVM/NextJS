// what is axios
// Axios is used to connect frontend to backend so you can easily send, receive, and manipulate data.

import React, { useEffect, useState } from "react";
import axios from "axios";
const Product = () => {
  const [product, setProduct] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    des: "",
  });
  const [editProduct, setEditProduct] = useState(null);
  const fetchProduct = async () => {
    try {
      const response = await axios.get("http://localhost:7050/");
      setProduct(response.data);
      // console.log("response", response.data);
    } catch (error) {
      console.error("Error in Get Products !!");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(newProduct, "NewProduct");
    if (!newProduct.name || !newProduct.price || !newProduct.des) {
      return alert("All Fields are Required!");
    }
    console.log(editProduct, "EditProduct");
    console.log(newProduct, "NewProduct");

    if (editProduct) {
      await axios.patch(`http://localhost:7050/${editProduct}`, newProduct);
      setEditProduct(null);
    } else {
      await axios.post("http://localhost:7050/", newProduct);
    }
    setNewProduct({ name: "", price: "", des: "" });
    fetchProduct();
  };

  const handleEditClick = (item) => {
    setNewProduct({ name: item.name, price: item.price, des: item.des });
    setEditProduct(item._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:7050/${id}`);
      fetchProduct();
    } catch (error) {
      console.error("Error in Delete Product");
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="">Enter Name : </label>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newProduct.name}
          onChange={handleChange}
        />
        <br />
        <br />
        <label htmlFor="">Enter Price : </label>
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleChange}
        />
        <br />
        <br />
        <label htmlFor="">Enter Description : </label>
        <input
          type="text"
          name="des"
          placeholder="Description"
          value={newProduct.des}
          onChange={handleChange}
        />
        <br />
        <br />
        <button type="submit">Add Product </button>
        <br />
        <br />
      </form>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {product.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.des}</td>
              <td>
                <button onClick={() => handleEditClick(p)}>Edit</button>
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Product;
