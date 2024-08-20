// Dashboard.js

import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Button, CircularProgress, TextField } from '@mui/material';
import api from './api';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total_sales: 0,
    total_purchases: 0,
    profit_loss: 0,
    low_stock_count: 0,
    total_products: 0,
    top_selling_products: [],
    recent_transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(currentDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardData();
    }
  }, [startDate, endDate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/dashboard?start_date=${startDate}&end_date=${endDate}`);
      console.log('API Response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values in case of an error
      setDashboardData({
        total_sales: 0,
        total_purchases: 0,
        profit_loss: 0,
        low_stock_count: 0,
        total_products: 0,
        top_selling_products: [],
        recent_transactions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '80vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button onClick={refreshData} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
          Refresh Data
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Profit/Loss</Typography>
          <Typography variant="h4" className={dashboardData.profit_loss >= 0 ? 'profit-text' : 'loss-text'}>
            ₹ {(dashboardData.profit_loss || 0).toFixed(2)} {dashboardData.profit_loss >= 0 ? '(Profit)' : '(Loss)'}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Low Stock Products</Typography>
          <Typography variant="h4" className="low-stock-warning">
            {dashboardData.low_stock_count || 0}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Total Sales</Typography>
          <Typography variant="h4">
            ₹ {(dashboardData.total_sales || 0).toFixed(2)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Total Purchases</Typography>
          <Typography variant="h4">
            ₹ {(dashboardData.total_purchases || 0).toFixed(2)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Total Products</Typography>
          <Typography variant="h4">
            {dashboardData.total_products || 0}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Top Selling Products</Typography>
          {dashboardData.top_selling_products && dashboardData.top_selling_products.length > 0 ? (
            <ul>
              {dashboardData.top_selling_products.map((product, index) => (
                <li key={index}>
                  {product.product_name} - Quantity: {product.total_quantity}, Sales: ₹{product.total_sales.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No data available</Typography>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={3} className="dashboard-card">
          <Typography variant="h6">Recent Transactions</Typography>
          {dashboardData.recent_transactions && dashboardData.recent_transactions.length > 0 ? (
            <ul>
              {dashboardData.recent_transactions.map((transaction, index) => (
                <li key={index}>
                  {transaction.product_name} - Type: {transaction.transaction_type},
                  Quantity: {transaction.quantity}, Price: ₹{transaction.final_price.toFixed(2)},
                  Date: {new Date(transaction.transaction_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No recent transactions</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard;