import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Wind } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wind className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AirAlert Pro</h1>
          </div>
          <Loader className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking your authentication status</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to welcome page instead of login directly
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
