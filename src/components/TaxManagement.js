import React, { useState } from 'react';
import { Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import api from './api';

function TaxManagement() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxReport, setTaxReport] = useState([]);

  const handleGenerateReport = async () => {
    try {
      const response = await api.get(`/tax-report?start_date=${startDate}&end_date=${endDate}`);
      if (Array.isArray(response.data)) {
        setTaxReport(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setTaxReport([]);
        alert('Received unexpected data format. Please try again.');
      }
    } catch (error) {
      console.error('Error generating tax report:', error);
      setTaxReport([]);
      alert('Failed to generate tax report. Please try again.');
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Tax Management
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
        <Button variant="contained" color="primary" onClick={handleGenerateReport}>
          Generate Tax Report
        </Button>
      </Grid>
      {taxReport && taxReport.length > 0 && (
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell align="right">Total Sales (INR)</TableCell>
                  <TableCell align="right">Total Tax (INR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxReport.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="right">{item.total_sales.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.total_tax.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}

export default TaxManagement;