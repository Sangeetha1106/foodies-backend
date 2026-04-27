import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ context }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="container centered"><h2>Authenticating...</h2></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet context={context} />;
};

export default ProtectedRoute;
