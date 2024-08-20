import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button } from '@mui/material';
import api from './api';

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productId, setProductId] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (productId) params.append('product_id', productId);

      const response = await api.get(`/purchases?${params.toString()}`);
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleFilter = () => {
    fetchPurchases();
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Purchase History
      </Typography>
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ marginRight: '10px' }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ marginRight: '10px' }}
        />
        <TextField
          label="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>GST Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.product_id}</TableCell>
                <TableCell>{purchase.quantity}</TableCell>
                <TableCell>INR{purchase.price.toFixed(2)}</TableCell>
                <TableCell>INR{purchase.final_price.toFixed(2)}</TableCell>
                <TableCell>INR{purchase.gst_amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(purchase.transaction_date).toLocaleString()}</TableCell>
                <TableCell>{purchase.supplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default PurchaseHistory;