import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Autocomplete } from '@mui/material';
import api from './api';

function SoldProduct() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [finalPrice, setFinalPrice] = useState('');
  const [finalPricePerUnit, setFinalPricePerUnit] = useState('');
  const [profitLoss, setProfitLoss] = useState(0);

  useEffect(() => {
    if (selectedProduct) {
      setFinalPricePerUnit(selectedProduct.selling_price);
      setFinalPrice(selectedProduct.selling_price * quantity);
      calculateProfitLoss(selectedProduct.purchase_price, selectedProduct.selling_price * quantity, quantity);
    }
  }, [selectedProduct, quantity]);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    try {
      const response = await api.get(`/products/search?term=${value}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleProductSelect = (event, product) => {
    setSelectedProduct(product);
    if (product) {
      setFinalPricePerUnit(product.selling_price);
      setFinalPrice(product.selling_price * quantity);
      calculateProfitLoss(product.purchase_price, product.selling_price * quantity, quantity);
    } else {
      setFinalPricePerUnit('');
      setFinalPrice('');
      setProfitLoss(0);
    }
  };

  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value) || 1;
    setQuantity(newQuantity);
    if (selectedProduct) {
      const newFinalPrice = finalPricePerUnit * newQuantity;
      setFinalPrice(newFinalPrice);
      calculateProfitLoss(selectedProduct.purchase_price, newFinalPrice, newQuantity);
    }
  };

  const handleFinalPricePerUnitChange = (event) => {
    const newFinalPricePerUnit = parseFloat(event.target.value) || 0;
    setFinalPricePerUnit(newFinalPricePerUnit);
    const newFinalPrice = newFinalPricePerUnit * quantity;
    setFinalPrice(newFinalPrice);
    if (selectedProduct) {
      calculateProfitLoss(selectedProduct.purchase_price, newFinalPrice, quantity);
    }
  };

  const handleFinalPriceChange = (event) => {
    const newFinalPrice = parseFloat(event.target.value) || 0;
    setFinalPrice(newFinalPrice);
    const newFinalPricePerUnit = newFinalPrice / quantity;
    setFinalPricePerUnit(newFinalPricePerUnit);
    if (selectedProduct) {
      calculateProfitLoss(selectedProduct.purchase_price, newFinalPrice, quantity);
    }
  };

  const calculateProfitLoss = (purchasePrice, finalSellPrice, qty) => {
    const totalPurchasePrice = purchasePrice * qty;
    const profit = finalSellPrice - totalPurchasePrice;
    setProfitLoss(profit);
  };

  const handleSell = async () => {
    if (!selectedProduct || !finalPrice) return;

    try {
      await api.post('/transactions', {
        product_id: selectedProduct.id,
        transaction_type: 'SELL',
        quantity: quantity,
        price: selectedProduct.selling_price,
        final_price: parseFloat(finalPrice),
        gst_amount: (finalPrice * selectedProduct.gst_rate) / (100 + selectedProduct.gst_rate),
      });
      // Reset form after successful sale
      setSearchTerm('');
      setSelectedProduct(null);
      setQuantity(1);
      setFinalPrice('');
      setFinalPricePerUnit('');
      setProfitLoss(0);
      alert('Product sold successfully!');
    } catch (error) {
      console.error('Error selling product:', error);
      alert('Error selling product. Please try again.');
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Sell Product
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Autocomplete
            options={searchResults}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Product"
                variant="outlined"
                fullWidth
                onChange={(e) => handleSearch(e.target.value)}
              />
            )}
            value={selectedProduct}
            onChange={handleProductSelect}
          />
        </Grid>
        {selectedProduct && (
          <>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Purchase Price (INR)"
                value={`₹${selectedProduct.purchase_price.toFixed(2)}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Selling Price (INR)"
                value={`₹${selectedProduct.selling_price.toFixed(2)}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                value={selectedProduct.stock_quantity}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="GST Rate"
                value={`${selectedProduct.gst_rate}%`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity to Sell"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                InputProps={{ inputProps: { min: 1, max: selectedProduct.stock_quantity } }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Final Price Per Unit (INR)"
                type="number"
                value={finalPricePerUnit}
                onChange={handleFinalPricePerUnitChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Final Price (INR)"
                type="number"
                value={finalPrice}
                onChange={handleFinalPriceChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6">
                Profit/Loss: ₹{profitLoss.toFixed(2)} {profitLoss >= 0 ? '(Profit)' : '(Loss)'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleSell}>
                Sell Product
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}

export default SoldProduct;