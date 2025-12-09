import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, soloAdmin = false }) => {
  const { user, isAuthenticated } = useAuth();
  
  // 1. Si no ha iniciado sesión, al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta es solo para ADMIN
  if (soloAdmin) {
    const roles = user?.roles || [];
    
    // Normalizamos para buscar "ADMIN" ya sea en strings o en objetos
    const permisos = Array.isArray(roles) ? roles.map(r => {
        if (typeof r === 'object' && r.authority) return r.authority;
        if (typeof r === 'string') return r;
        return ''; 
    }) : [];

    const esAdmin = permisos.includes('ADMIN') || permisos.includes('ROLE_ADMIN');

    if (!esAdmin) {
      // Si no es admin, lo mandamos al Home
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;