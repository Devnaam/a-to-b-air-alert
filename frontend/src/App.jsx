import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/common/Navbar';

// Import pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RoutePlanner from './pages/RoutePlanner';
import Navigation from './pages/Navigation';
import Profile from './pages/Profile';
import History from './pages/History';

// Main App Layout Component
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Show navbar only for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* ✅ Public routes (no authentication required) */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* ✅ Protected routes (authentication required) */}
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            
            <Route path="/plan" element={
              <PrivateRoute>
                <RoutePlanner />
              </PrivateRoute>
            } />
            
            <Route path="/navigate" element={
              <PrivateRoute>
                <Navigation />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/history" element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            } />
            
            {/* ✅ Default route - show welcome page for non-authenticated users */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
