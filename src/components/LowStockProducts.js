import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import api from './api';

function LowStockProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await api.get('/low-stock-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Low Stock Products
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Current Stock</TableCell>
              <TableCell>Minimum Stock Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>{product.min_stock_level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default LowStockProducts;