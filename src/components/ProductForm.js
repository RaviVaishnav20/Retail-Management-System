import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Grid, Typography, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from './api';

function ProductForm() {
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    gst_rate: '',
    min_stock_level: '',
    category: ''
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    if (id) {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (id) {
            await api.put(`/products/${id}`, product);
        } else {
            await api.post('/products', product);
        }
        navigate('/products');
    } catch (error) {
        console.error('Error saving product:', error);
    }
  };

  const categories = [
    'Tools',
    'Electrical',
    'Plumbing',
    'Paint',
    'Garden',
    'Hardware',
    'Other'
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Product' : 'Add New Product'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {!id && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product ID"
                name="id"
                value={product.id}
                onChange={handleChange}
                required
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Purchase Price"
              name="purchase_price"
              type="number"
              value={product.purchase_price}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <span>INR</span>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Selling Price"
              name="selling_price"
              type="number"
              value={product.selling_price}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <span>INR</span>,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              value={product.stock_quantity}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="GST Rate"
              name="gst_rate"
              type="number"
              value={product.gst_rate}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: <span>%</span>,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Minimum Stock Level"
              name="min_stock_level"
              type="number"
              value={product.min_stock_level}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Category"
              name="category"
              value={product.category}
              onChange={handleChange}
              required
            >
              {categories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {id ? 'Update' : 'Add'} Product
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default ProductForm;