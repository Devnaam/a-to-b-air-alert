import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route as RouteIcon, 
  Wind, 
  AlertTriangle,
  Loader,
  ArrowRight,
  RefreshCw,
  Shield,
  Zap,
  Leaf
} from 'lucide-react';
import { 
  geocodeAddress, 
  getDirections, 
  getRouteWithAQI, 
  calculateBreathabilityScore,
  routeAPI 
} from '../services/api';
import { getAQILevel, formatDuration, formatDistance, getHealthRecommendation } from '../utils/airQuality';

const RoutePlanner = () => {
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [error, setError] = useState('');
  const [showTimeIntelligence, setShowTimeIntelligence] = useState(false);

  const handlePlanRoute = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      setError('Please enter both origin and destination addresses');
      return;
    }

    setLoading(true);
    setError('');
    setRoutes([]);
    console.log('🚀 Starting route planning...');

    try {
      console.log('🔍 Step 1: Geocoding addresses...');
      
      // Geocode addresses using backend
      const [fromLocation, toLocation] = await Promise.all([
        geocodeAddress(fromAddress.trim()),
        geocodeAddress(toAddress.trim())
      ]);

      console.log('✅ Geocoding successful:', { fromLocation, toLocation });

      // Prepare route request data
      const routeRequest = {
        origin: {
          lat: fromLocation.location.lat,
          lng: fromLocation.location.lng,
          address: fromLocation.address
        },
        destination: {
          lat: toLocation.location.lat,
          lng: toLocation.location.lng,
          address: toLocation.address
        },
        alternatives: true
      };

      console.log('🗺️ Step 2: Planning routes with AQI analysis...');
      
      // Get routes with AQI analysis from backend
      const routeResponse = await routeAPI.planRoute(routeRequest);
      
      if (!routeResponse.data || !routeResponse.data.routes || routeResponse.data.routes.length === 0) {
        throw new Error('No routes found between these locations');
      }

      console.log('✅ Route planning successful:', routeResponse.data);

      // Process routes from backend response
      const processedRoutes = routeResponse.data.routes.map((routeData, index) => {
        const route = routeData.route;
        const analysis = routeData.analysis || {};
        
        // Extract route metrics
        const duration = route.legs?.[0]?.duration?.value || 0;
        const distance = route.legs?.[0]?.distance?.value || 0;
        const summary = route.summary || `Route ${index + 1}`;

        // Get breathability score from analysis or calculate default
        const breathability = analysis.breathabilityScore || 
          calculateBreathabilityScore(analysis.airQualityData || []);

        // Extract air quality data
        const airQualityData = analysis.airQualityData || [];

        return {
          id: index,
          route: route,
          analysis: analysis,
          airQualityData: airQualityData,
          breathability: breathability,
          duration: duration,
          distance: distance,
          summary: summary,
          isFastest: index === 0, // First route is typically fastest
          isHealthiest: false, // Will be determined below
          routeType: index === 0 ? 'fastest' : 'alternative',
          healthImpact: analysis.healthImpact || {
            avgAQI: breathability.avgAQI || 0,
            riskLevel: 'unknown'
          }
        };
      });

      // Determine healthiest route
      if (processedRoutes.length > 0) {
        const healthiestRoute = processedRoutes.reduce((best, current) => 
          (best.breathability.score < current.breathability.score) ? current : best
        );
        
        healthiestRoute.isHealthiest = true;
        healthiestRoute.routeType = 'healthiest';

        // Show time intelligence if air quality is poor
        if (healthiestRoute.breathability.avgAQI > 150) {
          setShowTimeIntelligence(true);
        }
      }

      console.log('✅ Processed routes:', processedRoutes);

      setRoutes(processedRoutes);
      setSelectedRoute(processedRoutes[0]);
      
    } catch (err) {
      console.error('❌ Route planning error:', err);
      
      // User-friendly error messages
      let errorMessage = 'Failed to plan route. Please try again.';
      
      if (err.message.includes('Location not found')) {
        errorMessage = 'Location not found. Please check your addresses and try again.';
      } else if (err.message.includes('server')) {
        errorMessage = 'Unable to connect to server. Please check if backend is running.';
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            console.log('📍 Got current location:', { latitude, longitude });
            // You could reverse geocode here to get a readable address
            setFromAddress(`${latitude}, ${longitude}`);
            setError('');
          } catch (error) {
            console.error('Current location error:', error);
            setFromAddress(`${latitude}, ${longitude}`);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get current location. Please check location permissions.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  const handleSelectRoute = (routeData) => {
    console.log('📍 Route selected:', routeData);
    setSelectedRoute(routeData);
  };

  const handleStartNavigation = (routeData) => {
    console.log('🧭 Starting navigation for route:', routeData);
    // Here you would typically navigate to a navigation page
    // or trigger navigation functionality
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#333333] mb-2">Plan Your Route</h1>
          <p className="text-gray-600">
            Compare routes based on speed and air quality to make the best choice for your health
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Input Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">Route Details</h2>
              
              <div className="space-y-4">
                {/* From Input */}
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fromAddress}
                      onChange={(e) => setFromAddress(e.target.value)}
                      placeholder="Enter starting location"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                    className="mt-2 text-sm text-[#4A90E2] hover:text-[#357ABD] disabled:text-gray-400 transition-colors"
                  >
                    {loading ? 'Getting location...' : 'Use current location'}
                  </button>
                </div>

                {/* To Input */}
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    To
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
                      disabled={loading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handlePlanRoute();
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Plan Route Button */}
                <button
                  onClick={handlePlanRoute}
                  disabled={loading || !fromAddress.trim() || !toAddress.trim()}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Planning Route...</span>
                    </>
                  ) : (
                    <>
                      <RouteIcon className="w-4 h-4" />
                      <span>Plan Route</span>
                    </>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2 text-red-800">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {routes.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <RouteIcon className="w-4 h-4" />
                      <span className="text-sm">
                        Found {routes.length} route{routes.length > 1 ? 's' : ''} with air quality analysis
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Intelligence Suggestion */}
            {showTimeIntelligence && (
              <div className="card mt-6 border-l-4 border-[#50E3C2]">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#50E3C2] mt-1" />
                  <div>
                    <h3 className="font-medium text-[#333333] mb-1">Time-of-Day Intelligence</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Current route has high pollution levels. Air quality typically improves in the evening hours.
                    </p>
                    <button className="text-sm bg-[#50E3C2] hover:bg-[#3DD9B7] text-white px-3 py-1 rounded transition-colors">
                      View Best Times
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Route Results */}
          <div className="lg:col-span-2">
            {routes.length > 0 && (
              <div className="space-y-6">
                {/* Route Comparison Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#333333]">Route Options</h2>
                    <div className="text-sm text-gray-600">
                      {routes.length} route{routes.length > 1 ? 's' : ''} found
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {routes.map((routeData) => {
                      const aqiLevel = getAQILevel(routeData.breathability.avgAQI || 0);
                      
                      return (
                        <div
                          key={routeData.id}
                          onClick={() => handleSelectRoute(routeData)}
                          className={`card cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                            selectedRoute?.id === routeData.id 
                              ? 'ring-2 ring-[#4A90E2] border-[#4A90E2] shadow-lg' 
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {routeData.isFastest && (
                                  <div className="flex items-center space-x-1">
                                    <Zap className="w-4 h-4 text-[#4A90E2]" />
                                    <span className="text-sm font-medium text-[#4A90E2]">Fastest Route</span>
                                  </div>
                                )}
                                {routeData.isHealthiest && (
                                  <div className="flex items-center space-x-1">
                                    <Leaf className="w-4 h-4 text-[#50E3C2]" />
                                    <span className="text-sm font-medium text-[#50E3C2]">Healthiest Route</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#333333]">
                                {routeData.breathability.grade || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Breathability</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Duration */}
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-[#333333]">
                                  {formatDuration(routeData.duration)}
                                </div>
                                <div className="text-xs text-gray-500">Duration</div>
                              </div>
                            </div>

                            {/* Distance */}
                            <div className="flex items-center space-x-2">
                              <RouteIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-[#333333]">
                                  {formatDistance(routeData.distance)}
                                </div>
                                <div className="text-xs text-gray-500">Distance</div>
                              </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center space-x-2">
                              <Wind className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-[#333333]">
                                  {routeData.breathability.score || 0}/100
                                </div>
                                <div className="text-xs text-gray-500">Score</div>
                              </div>
                            </div>

                            {/* AQI */}
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: aqiLevel.color }}
                              ></div>
                              <div>
                                <div className="text-sm font-medium text-[#333333]">
                                  {routeData.breathability.avgAQI || 0}
                                </div>
                                <div className="text-xs text-gray-500">Avg AQI</div>
                              </div>
                            </div>
                          </div>

                          {/* Route Path Preview */}
                          <div className="flex items-center space-x-1 mb-3">
                            <span className="text-xs text-gray-600">Route:</span>
                            <span className="text-xs text-[#333333] truncate">{routeData.summary}</span>
                          </div>

                          {/* Breathability Analysis */}
                          {routeData.breathability.analysis && (
                            <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              {routeData.breathability.analysis}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {routeData.isHealthiest && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartNavigation(routeData);
                                }}
                                className="btn-accent flex-1 text-sm py-2"
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  <Shield className="w-3 h-3" />
                                  <span>Choose Healthiest</span>
                                </div>
                              </button>
                            )}
                            {routeData.isFastest && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartNavigation(routeData);
                                }}
                                className="btn-primary flex-1 text-sm py-2"
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  <Zap className="w-3 h-3" />
                                  <span>Choose Fastest</span>
                                </div>
                              </button>
                            )}
                            {!routeData.isFastest && !routeData.isHealthiest && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartNavigation(routeData);
                                }}
                                className="btn-secondary flex-1 text-sm py-2"
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  <ArrowRight className="w-3 h-3" />
                                  <span>Select Route</span>
                                </div>
                              </button>
                            )}
                          </div>

                          {/* Healthiest Route Suggestion */}
                          {routeData.isFastest && !routeData.isHealthiest && routes.find(r => r.isHealthiest) && (
                            <div className="mt-3 p-3 bg-[#50E3C2] bg-opacity-10 border border-[#50E3C2] rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Leaf className="w-4 h-4 text-[#50E3C2]" />
                                <div className="text-sm">
                                  <span className="font-medium text-[#333333]">Healthier Route Available!</span>
                                  <div className="text-[#50E3C2] font-medium">
                                    +{formatDuration(routes.find(r => r.isHealthiest).duration - routeData.duration)} • 
                                    -{routeData.breathability.avgAQI - routes.find(r => r.isHealthiest).breathability.avgAQI} AQI Points
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Route Recommendation Summary */}
                {routes.length > 1 && (
                  <div className="card bg-gradient-to-r from-[#4A90E2] to-[#50E3C2] text-white">
                    <h3 className="font-semibold mb-2">Route Recommendation</h3>
                    <p className="text-sm opacity-90 mb-3">
                      Based on current conditions, we recommend the {' '}
                      {routes.find(r => r.isHealthiest)?.breathability.avgAQI < 100 ? 'healthiest' : 'fastest'} route 
                      for your journey.
                    </p>
                    <button 
                      onClick={() => handleSelectRoute(routes.find(r => r.isHealthiest) || routes[0])}
                      className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors"
                    >
                      Accept Recommendation
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="card text-center py-12">
                <Loader className="w-8 h-8 text-[#4A90E2] mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-[#333333] mb-2">Planning Your Route</h3>
                <p className="text-gray-600">
                  Analyzing air quality along multiple routes...
                </p>
              </div>
            )}

            {/* No Results State */}
            {!loading && routes.length === 0 && !error && (
              <div className="card text-center py-12">
                <RouteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#333333] mb-2">Plan Your First Route</h3>
                <p className="text-gray-600 mb-4">
                  Enter your starting point and destination to see route options with air quality information
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Wind className="w-4 h-4" />
                    <span>Real-time AQI</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Health Analysis</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Time Intelligence</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
