import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wind, 
  Shield, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Check
} from 'lucide-react';

const Welcome = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            {/* Navigation */}
            <nav className="relative flex items-center justify-between pt-6 pb-8">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Wind className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">AirAlert Pro</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </nav>

            {/* Hero Content */}
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Plan Routes for</span>
                  <span className="block text-blue-600">Your Health</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Get real-time air quality insights along your routes. Choose healthier paths with personalized recommendations based on your health profile.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Start Free Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 border-blue-600 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-blue-100 to-green-100 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Health First</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Smart Routes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Real-time AQI</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Personalized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose AirAlert Pro?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to make healthier travel decisions
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Health-First Routing</h3>
              <p className="mt-2 text-base text-gray-500">
                Routes optimized for your specific health conditions and sensitivities
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Air Quality</h3>
              <p className="mt-2 text-base text-gray-500">
                Live AQI data along your entire route with predictive alerts
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Navigation</h3>
              <p className="mt-2 text-base text-gray-500">
                Turn-by-turn navigation with proactive health alerts
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">What Our Users Say</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "Finally, a navigation app that considers my asthma. The healthiest route feature is a game-changer!"
              </p>
              <p className="mt-4 text-sm font-medium text-gray-900">- Sarah M.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "The real-time air quality alerts help me make better decisions for my family's health."
              </p>
              <p className="mt-4 text-sm font-medium text-gray-900">- Michael R.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "Smart, intuitive, and actually cares about health. This is the future of navigation."
              </p>
              <p className="mt-4 text-sm font-medium text-gray-900">- Dr. Lisa K.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">AirAlert Pro</span>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="text-gray-300 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 AirAlert Pro. Making travel healthier, one route at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
