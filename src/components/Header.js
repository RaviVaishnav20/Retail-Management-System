import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Nirupama Enterprise
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/products">
          Products
        </Button>
        <Button color="inherit" component={Link} to="/add-product">
          Add Product
        </Button>
        <Button color="inherit" component={Link} to="/add-purchase">
          Add Purchase
        </Button>
        <Button color="inherit" component={Link} to="/low-stock">
          Low Stock
        </Button>
        <Button color="inherit" component={Link} to="/sell">
          Sell Product
        </Button>
        <Button color="inherit" component={Link} to="/purchases">
          Purchase History
        </Button>
        <Button color="inherit" component={Link} to="/tax-management">
          Tax Management
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;