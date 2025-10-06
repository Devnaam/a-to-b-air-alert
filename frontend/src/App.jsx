import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import RoutePlanner from './pages/RoutePlanner';
import Navigation from './pages/Navigation';
import Profile from './pages/Profile';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<RoutePlanner />} />
            <Route path="/navigate" element={<Navigation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
