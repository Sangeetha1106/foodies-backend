import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    const admin = JSON.parse(localStorage.getItem('admin'));

    if (!admin || admin.role !== 'admin') {
        return <Navigate to="/admin-login" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
