import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/loader/Loader.jsx';

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = String(user?.user?.role || user?.role || '').toUpperCase();
  const isRoleAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  if (isRoleAdmin) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;
