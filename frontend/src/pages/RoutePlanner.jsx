import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route as RouteIcon, 
  Wind, 
  AlertTriangle,
  Loader,
  Map,
  Eye,
  MapPin as LocationIcon
} from 'lucide-react';
import { 
  geocodeAddress, 
  routeAPI 
} from '../services/api';
import RouteCards from '../components/RouteCards';
import RouteMapView from '../components/RouteMapView';

const RoutePlanner = () => {
  // State management
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [error, setError] = useState('');
  const [showTimeIntelligence, setShowTimeIntelligence] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Smart reverse geocoding with multiple fallbacks
  const reverseGeocode = async (lat, lng) => {
    try {
      console.log('🔄 Attempting reverse geocoding for:', { lat, lng });
      
      // Check if routeAPI.reverseGeocode exists
      if (typeof routeAPI.reverseGeocode !== 'function') {
        console.warn('⚠️ routeAPI.reverseGeocode not available, using browser-based geocoding');
        return await browserReverseGeocode(lat, lng);
      }
      
      const response = await routeAPI.reverseGeocode({ 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      });
      
      console.log('✅ Backend reverse geocode response:', response);
      
      if (response.status === 'success' && response.data && response.data.address) {
        const exactAddress = response.data.address;
        console.log('✅ Exact address found:', exactAddress);
        return exactAddress;
      } else {
        throw new Error('No address found in backend response');
      }
    } catch (error) {
      console.error('❌ Backend reverse geocoding failed:', error);
      
      // Fallback to browser-based geocoding
      try {
        return await browserReverseGeocode(lat, lng);
      } catch (fallbackError) {
        console.error('❌ All reverse geocoding methods failed:', fallbackError);
        
        // Final fallback to smart coordinate display
        return getSmartCoordinateDisplay(lat, lng);
      }
    }
  };

  // Browser-based reverse geocoding using Google Maps (if loaded)
  const browserReverseGeocode = async (lat, lng) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          console.log('✅ Browser reverse geocoding successful:', results[0].formatted_address);
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Browser geocoding failed: ' + status));
        }
      });
    });
  };

  // Smart coordinate display with location hints
  const getSmartCoordinateDisplay = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    // Add location hints based on coordinates
    let locationHint = '';
    
    // India bounds check with detailed regions
    if (latitude >= 6.0 && latitude <= 37.6 && longitude >= 68.7 && longitude <= 97.25) {
      // Major cities detection with tighter bounds
      if (latitude >= 28.40 && latitude <= 28.88 && longitude >= 76.80 && longitude <= 77.50) {
        locationHint = ' (New Delhi area)';
      } else if (latitude >= 19.00 && latitude <= 19.30 && longitude >= 72.70 && longitude <= 73.00) {
        locationHint = ' (Mumbai area)';
      } else if (latitude >= 12.80 && latitude <= 13.20 && longitude >= 77.40 && longitude <= 77.80) {
        locationHint = ' (Bangalore area)';
      } else if (latitude >= 13.00 && latitude <= 13.30 && longitude >= 80.10 && longitude <= 80.40) {
        locationHint = ' (Chennai area)'; // This should match your location
      } else if (latitude >= 17.20 && latitude <= 17.60 && longitude >= 78.20 && longitude <= 78.70) {
        locationHint = ' (Hyderabad area)';
      } else if (latitude >= 22.40 && latitude <= 22.80 && longitude >= 88.20 && longitude <= 88.50) {
        locationHint = ' (Kolkata area)';
      } else if (latitude >= 18.40 && latitude <= 18.80 && longitude >= 73.70 && longitude <= 74.20) {
        locationHint = ' (Pune area)';
      } else {
        // State-level detection
        if (latitude >= 8.0 && latitude <= 12.8 && longitude >= 74.8 && longitude <= 78.0) {
          locationHint = ' (Kerala/Karnataka)';
        } else if (latitude >= 10.0 && latitude <= 16.0 && longitude >= 78.0 && longitude <= 84.0) {
          locationHint = ' (Tamil Nadu/Andhra Pradesh)';
        } else if (latitude >= 15.0 && latitude <= 22.0 && longitude >= 72.0 && longitude <= 80.0) {
          locationHint = ' (Maharashtra/Madhya Pradesh)';
        } else {
          locationHint = ' (India)';
        }
      }
    } else {
      locationHint = '';
    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}${locationHint}`;
  };

  // Enhanced current location with high accuracy and multiple attempts
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setGeoLoading(true);
    setError('');
    setLocationStatus('Getting your location...');
    
    // Enhanced geolocation options
    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // 20 seconds
      maximumAge: 60000 // 1 minute cache
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Got location:', { 
          latitude, 
          longitude, 
          accuracy: `${accuracy}m`,
          timestamp: new Date(position.timestamp).toLocaleTimeString()
        });
        
        setLocationStatus(`Location found (accuracy: ${Math.round(accuracy)}m)`);
        
        try {
          // Show coordinates immediately for quick feedback
          const coordDisplay = getSmartCoordinateDisplay(latitude, longitude);
          setFromAddress(coordDisplay);
          setLocationStatus('Getting exact address...');
          
          // Then try to get the exact address
          const exactAddress = await reverseGeocode(latitude, longitude);
          
          // Update with the real address
          setFromAddress(exactAddress);
          setError('');
          setLocationStatus('');
          
          console.log('✅ Current location set successfully:', exactAddress);
        } catch (error) {
          console.error('❌ Address lookup failed:', error);
          // Keep the smart coordinate display
          const coordDisplay = getSmartCoordinateDisplay(latitude, longitude);
          setFromAddress(coordDisplay);
          setLocationStatus('Using coordinates (address lookup failed)');
          
          // Clear status after 3 seconds
          setTimeout(() => setLocationStatus(''), 3000);
        } finally {
          setGeoLoading(false);
        }
      },
      async (error) => {
        console.error('❌ High accuracy geolocation failed:', error);
        
        // Try again with lower accuracy as fallback
        setLocationStatus('High accuracy failed, trying standard GPS...');
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log('📍 Got location (standard accuracy):', { 
              latitude, 
              longitude, 
              accuracy: `${accuracy}m`
            });
            
            setLocationStatus(`Location found (accuracy: ${Math.round(accuracy)}m)`);
            
            try {
              const coordDisplay = getSmartCoordinateDisplay(latitude, longitude);
              setFromAddress(coordDisplay);
              setLocationStatus('Getting exact address...');
              
              const exactAddress = await reverseGeocode(latitude, longitude);
              setFromAddress(exactAddress);
              setError('');
              setLocationStatus('');
              
              console.log('✅ Current location set (standard accuracy):', exactAddress);
            } catch (addrError) {
              const coordDisplay = getSmartCoordinateDisplay(latitude, longitude);
              setFromAddress(coordDisplay);
              setLocationStatus('Using coordinates (address lookup failed)');
              setTimeout(() => setLocationStatus(''), 3000);
            } finally {
              setGeoLoading(false);
            }
          },
          (fallbackError) => {
            console.error('❌ All geolocation attempts failed:', fallbackError);
            
            let errorMessage = 'Unable to get your current location.';
            
            switch(fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location permissions in your browser settings and try again.';
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your GPS, WiFi, or mobile data connection.';
                break;
              case fallbackError.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again or enter your address manually.';
                break;
              default:
                errorMessage = 'An unexpected error occurred while getting your location. Please try again.';
                break;
            }
            
            setError(errorMessage);
            setLocationStatus('');
            setGeoLoading(false);
          },
          {
            enableHighAccuracy: false, // Lower accuracy for fallback
            timeout: 15000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      },
      options
    );
  };

  // Route planning function (unchanged)
  const handlePlanRoute = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      setError('Please enter both origin and destination addresses');
      return;
    }

    setLoading(true);
    setError('');
    setRoutes([]);
    setSelectedRoute(null);
    console.log('🚀 Starting route planning...');

    try {
      console.log('🔍 Step 1: Geocoding addresses...');
      
      const [fromLocation, toLocation] = await Promise.all([
        geocodeAddress(fromAddress.trim()),
        geocodeAddress(toAddress.trim())
      ]);

      console.log('✅ Geocoding successful:', { fromLocation, toLocation });

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
      
      const routeResponse = await routeAPI.planRoute(routeRequest);
      
      if (!routeResponse.data || !routeResponse.data.routes || routeResponse.data.routes.length === 0) {
        throw new Error('No routes found between these locations');
      }

      console.log('✅ Route planning successful:', routeResponse.data);

      // Process routes from backend response
      const processedRoutes = routeResponse.data.routes.map((routeData, index) => {
        const route = routeData.route;
        const analysis = routeData.analysis || {};
        
        const duration = route.legs?.[0]?.duration?.value || 0;
        const distance = route.legs?.[0]?.distance?.value || 0;
        const summary = route.summary || `Route ${index + 1}`;

        const breathability = analysis.breathabilityScore || {
          score: 50,
          grade: 'N/A',
          avgAQI: 50,
          analysis: 'No air quality data available'
        };

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
          isFastest: index === 0,
          isHealthiest: false,
          routeType: index === 0 ? 'fastest' : 'alternative',
          healthImpact: analysis.healthImpact || {
            avgAQI: breathability.avgAQI || 0,
            riskLevel: 'unknown'
          }
        };
      });

      // Determine healthiest route
      if (processedRoutes.length > 1) {
        const healthiestRoute = processedRoutes.reduce((best, current) => 
          (best.breathability.score < current.breathability.score) ? current : best
        );
        
        healthiestRoute.isHealthiest = true;
        healthiestRoute.routeType = 'healthiest';

        if (healthiestRoute.breathability.avgAQI > 150) {
          setShowTimeIntelligence(true);
        }
      }

      console.log('✅ Processed routes:', processedRoutes);

      setRoutes(processedRoutes);
      setSelectedRoute(processedRoutes[0]);
      setShowMap(true); // Show map after successful route planning
      
    } catch (err) {
      console.error('❌ Route planning error:', err);
      
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

  const handleSelectRoute = (routeData) => {
    console.log('📍 Route selected:', routeData);
    setSelectedRoute(routeData);
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Route Input + Route Cards */}
          <div className="space-y-6">
            {/* Route Input Form */}
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
                      disabled={loading || geoLoading}
                    />
                  </div>
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={loading || geoLoading}
                    className="mt-2 text-sm text-[#4A90E2] hover:text-[#357ABD] disabled:text-gray-400 transition-colors flex items-center space-x-1"
                  >
                    {geoLoading ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        <span>Getting precise location...</span>
                      </>
                    ) : (
                      <>
                        <LocationIcon className="w-3 h-3" />
                        <span>Use current location</span>
                      </>
                    )}
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

                {/* Map Toggle Button */}
                {routes.length > 0 && (
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="w-full btn-secondary flex items-center justify-center space-x-2 text-sm"
                  >
                    {showMap ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Hide Map</span>
                      </>
                    ) : (
                      <>
                        <Map className="w-4 h-4" />
                        <span>Show Map</span>
                      </>
                    )}
                  </button>
                )}

                {/* Location Status */}
                {locationStatus && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{locationStatus}</span>
                    </div>
                  </div>
                )}

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
              <div className="card border-l-4 border-[#50E3C2]">
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

            {/* Route Cards Component */}
            <RouteCards
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={handleSelectRoute}
              loading={loading}
            />
          </div>

          {/* Right Column: Map View */}
          {showMap && routes.length > 0 && (
            <RouteMapView
              routes={routes}
              selectedRoute={selectedRoute}
              fromAddress={fromAddress}
              toAddress={toAddress}
              onSelectRoute={handleSelectRoute}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
