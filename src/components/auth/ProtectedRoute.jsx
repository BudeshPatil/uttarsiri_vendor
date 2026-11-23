import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../BrandLogo';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card shadow-lg ring-1 ring-border flex items-center justify-center mx-auto mb-4 p-2 animate-pulse">
            <BrandLogo variant="favicon" alt="Site Logo" className="w-10 h-10" />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
