import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from './api';

function PurchaseForm() {
  const [purchase, setPurchase] = useState({
    product_id: '',
    quantity: '',
    price: '',
    supplier: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPurchase(prevPurchase => ({
      ...prevPurchase,
      [name]: value
    }));
  };

  const handleProductChange = (event, newValue) => {
    setPurchase(prevPurchase => ({
      ...prevPurchase,
      product_id: newValue ? newValue.id : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...purchase,
        transaction_type: 'PURCHASE'
      });
      navigate('/purchases');
    } catch (error) {
      console.error('Error adding purchase:', error);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Add New Purchase
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => option.name}
              onChange={handleProductChange}
              renderInput={(params) => <TextField {...params} label="Product" required />}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={purchase.quantity}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Purchase Price"
              name="price"
              type="number"
              value={purchase.price}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <span>INR</span>,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Supplier"
              name="supplier"
              value={purchase.supplier}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Purchase Date"
              name="transaction_date"
              type="date"
              value={purchase.transaction_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Add Purchase
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default PurchaseForm;