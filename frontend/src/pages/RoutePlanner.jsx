import React, { useState, useEffect } from 'react';
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
  Search,
  X,
  Crosshair,
  RotateCcw
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
  const [showMap, setShowMap] = useState(true); // ✅ Always show map by default
  const [locationStatus, setLocationStatus] = useState('');

  // ✅ NEW: Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState('');

  // ✅ NEW: Current location state for always-on map
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(true);

  // ✅ NEW: Map view mode state
  const [mapViewMode, setMapViewMode] = useState('current'); // 'current', 'search', 'route'
  const [searchedLocation, setSearchedLocation] = useState(null);

  // Real reverse geocoding function (unchanged)
  const reverseGeocode = async (lat, lng) => {
    try {
      console.log('🔄 Getting exact location name for:', lat, lng);
      
      const response = await routeAPI.reverseGeocode({ 
        lat: parseFloat(lat), 
        lng: parseFloat(lng) 
      });
      
      if (response.status === 'success' && response.data && response.data.address) {
        const exactAddress = response.data.address;
        console.log('✅ Exact address found:', exactAddress);
        return exactAddress;
      } else {
        throw new Error('No address found in response');
      }
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
    }
  };

  // ✅ NEW: Get current location on component mount
  useEffect(() => {
    const getCurrentLocationOnLoad = async () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        setCurrentLocationLoading(false);
        return;
      }

      setCurrentLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Got initial current location:', { latitude, longitude });
          
          try {
            const address = await reverseGeocode(latitude, longitude);
            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              address: address,
              accuracy: position.coords.accuracy
            });
            
            console.log('✅ Current location set for map:', address);
          } catch (error) {
            console.error('❌ Failed to get address for current location:', error);
            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              accuracy: position.coords.accuracy
            });
          } finally {
            setCurrentLocationLoading(false);
          }
        },
        (error) => {
          console.error('❌ Failed to get current location on load:', error);
          setCurrentLocationLoading(false);
          // Set default location (Delhi) if geolocation fails
          setCurrentLocation({
            lat: 28.6139,
            lng: 77.2090,
            address: 'New Delhi, India',
            accuracy: null,
            isDefault: true
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    };

    getCurrentLocationOnLoad();
  }, []);

  // ✅ NEW: Search places functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      console.log('🔍 Searching for:', query);
      
      // Use geocoding API to search for places
      const response = await geocodeAddress(query);
      
      // Create search results array (in real scenario, you might get multiple results)
      const searchResult = {
        id: 1,
        name: response.address,
        address: response.address,
        location: response.location,
        placeId: response.placeId,
        types: response.types || []
      };

      setSearchResults([searchResult]);
      setShowSearchResults(true);
      
      console.log('✅ Search results:', [searchResult]);
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchError('No results found. Try a different search term.');
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // ✅ NEW: Handle search result selection
  const handleSearchResultSelect = async (result) => {
    console.log('📍 Selected search result:', result);
    
    setSearchedLocation({
      lat: result.location.lat,
      lng: result.location.lng,
      address: result.address,
      name: result.name,
      placeId: result.placeId
    });
    
    setMapViewMode('search');
    setShowSearchResults(false);
    setSearchQuery(result.name || result.address);
  };

  // ✅ NEW: Clear search and return to current location
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchError('');
    setSearchedLocation(null);
    setMapViewMode('current');
  };

  // Enhanced current location handler (updated)
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setGeoLoading(true);
    setError('');
    setLocationStatus('Getting your precise location...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Got current location for form:', { latitude, longitude, accuracy });
        
        setLocationStatus(`Location found (accuracy: ${Math.round(accuracy)}m)`);
        
        try {
          const coordDisplay = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFromAddress(coordDisplay);
          setLocationStatus('Getting exact address...');
          
          const exactAddress = await reverseGeocode(latitude, longitude);
          setFromAddress(exactAddress);
          setError('');
          setLocationStatus('');
          
          // Also update the current location for map
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            address: exactAddress,
            accuracy: accuracy
          });
          
          console.log('✅ Current location updated everywhere:', exactAddress);
        } catch (error) {
          console.error('❌ Address lookup failed:', error);
          const coordDisplay = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFromAddress(coordDisplay);
          setLocationStatus('Using coordinates (address lookup failed)');
          setTimeout(() => setLocationStatus(''), 3000);
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        let errorMessage = 'Unable to get current location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setLocationStatus('');
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // Route planning function (updated to change map mode)
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

        return {
          id: index,
          route: route,
          analysis: analysis,
          airQualityData: analysis.airQualityData || [],
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
      setMapViewMode('route'); // ✅ Switch to route view mode
      
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
          {/* Left Column: Search + Route Input + Route Cards */}
          <div className="space-y-6">
            {/* ✅ NEW: Search Places Card */}
            <div className="card">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">Explore Places</h2>
              
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) {
                        handleSearch(e.target.value);
                      } else {
                        handleClearSearch();
                      }
                    }}
                    placeholder="Search for any place, city, or address..."
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-3 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {searchLoading && (
                    <Loader className="absolute right-3 top-3 w-4 h-4 text-[#4A90E2] animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleSearchResultSelect(result)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-[#4A90E2] mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#333333] truncate">
                              {result.name || result.address}
                            </div>
                            {result.name && result.name !== result.address && (
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {result.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Error */}
                {searchError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{searchError}</span>
                    </div>
                  </div>
                )}

                {/* Map View Controls */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setMapViewMode('current');
                      handleClearSearch();
                    }}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                      mapViewMode === 'current'
                        ? 'bg-[#4A90E2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>Current Location</span>
                  </button>
                  
                  {routes.length > 0 && (
                    <button
                      onClick={() => setMapViewMode('route')}
                      className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                        mapViewMode === 'route'
                          ? 'bg-[#50E3C2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <RouteIcon className="w-4 h-4" />
                      <span>Routes</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                        <Crosshair className="w-3 h-3" />
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
                  {/* Quick fill from search */}
                  {searchedLocation && (
                    <button
                      onClick={() => setToAddress(searchedLocation.address)}
                      className="mt-2 text-sm text-[#50E3C2] hover:text-[#3DD9B7] transition-colors flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Use searched location</span>
                    </button>
                  )}
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

          {/* ✅ Right Column: Always-On Enhanced Map View */}
          <RouteMapView
            routes={routes}
            selectedRoute={selectedRoute}
            fromAddress={fromAddress}
            toAddress={toAddress}
            onSelectRoute={handleSelectRoute}
            currentLocation={currentLocation}
            currentLocationLoading={currentLocationLoading}
            searchedLocation={searchedLocation}
            mapViewMode={mapViewMode}
            showMap={showMap}
          />
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
