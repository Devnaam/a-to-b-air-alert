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
import { geocodeAddress, getDirections, getRouteAirQuality, calculateBreathabilityScore } from '../services/api';
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

    try {
      // Geocode addresses
      const [fromLocation, toLocation] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress)
      ]);

      // Get directions (multiple routes)
      const routesData = await getDirections(fromLocation.location, toLocation.location);
      
      // Process each route with air quality data
      const processedRoutes = await Promise.all(
        routesData.map(async (route, index) => {
          const airQualityData = await getRouteAirQuality(route);
          const breathability = calculateBreathabilityScore(airQualityData);
          
          return {
            id: index,
            route,
            airQualityData,
            breathability,
            duration: route.legs[0].duration.value,
            distance: route.legs[0].distance.value,
            summary: route.summary,
            isFastest: index === 0,
            isHealthiest: false,
            routeType: index === 0 ? 'fastest' : 'healthiest'
          };
        })
      );

      // Mark the healthiest route
      const healthiestRoute = processedRoutes.reduce((best, current) => 
        (best.breathability.score < current.breathability.score) ? current : best
      );
      healthiestRoute.isHealthiest = true;
      healthiestRoute.routeType = 'healthiest';

      setRoutes(processedRoutes);
      setSelectedRoute(processedRoutes[0]);
      
      // Show time intelligence if conditions are met
      if (healthiestRoute.breathability.avgAQI > 150) {
        setShowTimeIntelligence(true);
      }

    } catch (err) {
      setError('Failed to plan route. Please check your addresses and try again.');
      console.error('Route planning error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFromAddress(`${latitude}, ${longitude}`);
        },
        (error) => {
          setError('Unable to get current location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    />
                  </div>
                  <button
                    onClick={handleUseCurrentLocation}
                    className="mt-2 text-sm text-[#4A90E2] hover:text-[#357ABD]"
                  >
                    Use current location
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    />
                  </div>
                </div>

                {/* Plan Route Button */}
                <button
                  onClick={handlePlanRoute}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
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
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
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
                      Planning to leave at 8 AM? The route AQI is 185. The forecast shows it will drop to 115 by 10 AM.
                    </p>
                    <button className="text-sm bg-[#50E3C2] hover:bg-[#3DD9B7] text-white px-3 py-1 rounded">
                      Set Reminder for 10 AM
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
                  <h2 className="text-lg font-semibold text-[#333333] mb-4">Route Options</h2>
                  <div className="grid gap-4">
                    {routes.map((routeData) => {
                      const aqiLevel = getAQILevel(routeData.breathability.avgAQI);
                      
                      return (
                        <div
                          key={routeData.id}
                          onClick={() => setSelectedRoute(routeData)}
                          className={`card cursor-pointer transition-all hover:shadow-md ${
                            selectedRoute?.id === routeData.id 
                              ? 'ring-2 ring-[#4A90E2] border-[#4A90E2]' 
                              : ''
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
                                {routeData.breathability.grade}
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
                                  {routeData.breathability.score}/100
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
                                  {routeData.breathability.avgAQI}
                                </div>
                                <div className="text-xs text-gray-500">Avg AQI</div>
                              </div>
                            </div>
                          </div>

                          {/* Route Path Preview */}
                          <div className="flex items-center space-x-1 mb-3">
                            <span className="text-xs text-gray-600">Route:</span>
                            <span className="text-xs text-[#333333]">{routeData.summary}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {routeData.isHealthiest && (
                              <button className="btn-accent flex-1 text-sm py-2">
                                <div className="flex items-center justify-center space-x-1">
                                  <Shield className="w-3 h-3" />
                                  <span>Choose Healthiest</span>
                                </div>
                              </button>
                            )}
                            {routeData.isFastest && (
                              <button className="btn-primary flex-1 text-sm py-2">
                                <div className="flex items-center justify-center space-x-1">
                                  <Zap className="w-3 h-3" />
                                  <span>Choose Fastest</span>
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
              </div>
            )}

            {/* No Results State */}
            {!loading && routes.length === 0 && !error && (
              <div className="card text-center py-12">
                <RouteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#333333] mb-2">Plan Your First Route</h3>
                <p className="text-gray-600">
                  Enter your starting point and destination to see route options with air quality information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
