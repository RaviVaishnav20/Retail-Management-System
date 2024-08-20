import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { AuthProvider, useAuth } from './components/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import Dashboard from './components/Dashboard';
import LowStockProducts from './components/LowStockProducts';
import SoldProduct from './components/SoldProduct';
import TaxManagement from './components/TaxManagement';
import PurchaseHistory from './components/PurchaseHistory';
import PurchaseForm from './components/PurchaseForm';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Container>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/add-purchase" element={<PurchaseForm />} />
//            <Route path="/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
//            <Route path="/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/low-stock" element={<ProtectedRoute><LowStockProducts /></ProtectedRoute>} />
            <Route path="/sell" element={<ProtectedRoute><SoldProduct /></ProtectedRoute>} />
            <Route path="/tax-management" element={<ProtectedRoute><TaxManagement /></ProtectedRoute>} />
            <Route path="/purchases" element={<PurchaseHistory />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;