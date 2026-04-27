import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const AppContent = ({ searchTerm, setSearchTerm }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="container centered"><h2>Loading...</h2></div>;
  }

  return (
    <div className="app">
      <Navbar onSearch={setSearchTerm} />
      <main>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Home />} />

          {/* User Auth Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/menu" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/menu" replace /> : <Register />} 
          />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Login - Separate */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute context={{ searchTerm }} />}>
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
