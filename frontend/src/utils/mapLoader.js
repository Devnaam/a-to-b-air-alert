// Google Maps API loader utility - Optimized for performance and reliability

let isLoading = false;
let isLoaded = false;
let loadPromise = null;
let mapInstance = null;

// Check if Google Maps API key is configured
const isAPIKeyConfigured = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return apiKey && apiKey !== 'your_google_maps_api_key_here_optional' && apiKey.length > 10;
};

// Google Maps API loader with async/defer optimization
export const loadGoogleMapsAPI = () => {
  // Return cached promise if already loading or loaded
  if (loadPromise) {
    return loadPromise;
  }

  // Check if already loaded
  if (window.google && window.google.maps) {
    isLoaded = true;
    console.log('✅ Google Maps API already loaded');
    return Promise.resolve(window.google.maps);
  }

  // Check if API key is configured
  if (!isAPIKeyConfigured()) {
    console.warn('⚠️ Google Maps API key not configured, map features will be limited');
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  isLoading = true;
  console.log('🔄 Loading Google Maps API...');

  loadPromise = new Promise((resolve, reject) => {
    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('🔄 Google Maps script already exists, waiting for load...');
      
      // Wait for existing script to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          isLoaded = true;
          isLoading = false;
          console.log('✅ Google Maps API loaded from existing script');
          resolve(window.google.maps);
        }
      }, 100);
      
      // Timeout after 15 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        isLoading = false;
        reject(new Error('Google Maps API loading timeout'));
      }, 15000);
      
      return;
    }

    // Create and configure script element
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Optimized script configuration
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&loading=async&v=weekly`;
    script.async = true;  // ✅ This fixes the performance warning
    script.defer = true;  // ✅ Additional optimization
    script.type = 'text/javascript';
    
    // Add unique ID for easier debugging
    script.id = 'google-maps-api-script';
    
    // Success handler
    script.onload = () => {
      console.log('📜 Google Maps script loaded');
      
      // Verify API is actually available
      if (window.google && window.google.maps) {
        isLoaded = true;
        isLoading = false;
        console.log('✅ Google Maps API loaded successfully');
        resolve(window.google.maps);
      } else {
        isLoading = false;
        const error = new Error('Google Maps API object not found after script load');
        console.error('❌', error);
        reject(error);
      }
    };
    
    // Error handler
    script.onerror = (event) => {
      isLoading = false;
      const error = new Error(`Failed to load Google Maps API: ${event.message || 'Network error'}`);
      console.error('❌', error);
      reject(error);
    };
    
    // Append to head
    document.head.appendChild(script);
    console.log('📜 Google Maps script added to DOM');
  });

  return loadPromise;
};

// Initialize Google Maps API with enhanced error handling
export const initializeGoogleMaps = async () => {
  try {
    if (!isAPIKeyConfigured()) {
      console.warn('⚠️ Google Maps API key not configured - map features will be limited');
      return false;
    }

    console.log('🚀 Initializing Google Maps API...');
    const maps = await loadGoogleMapsAPI();
    
    // Verify core services are available
    if (maps.Map && maps.Marker) {
      console.log('✅ Google Maps API initialized successfully');
      return true;
    } else {
      throw new Error('Google Maps core services not available');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Google Maps API:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('key')) {
      console.error('💡 Solution: Check your VITE_GOOGLE_MAPS_API_KEY in .env file');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Solution: Check your internet connection and try again');
    } else if (error.message.includes('Network')) {
      console.error('💡 Solution: Verify API key restrictions in Google Cloud Console');
    }
    
    return false;
  }
};

// Create a map instance with error handling
export const createMapInstance = async (container, options = {}) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    if (!container) {
      throw new Error('Map container element is required');
    }

    const defaultOptions = {
      center: { lat: 28.6139, lng: 77.2090 }, // Delhi as default
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      styles: [
        // Subtle styling for better UX
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }]
        }
      ],
      ...options
    };

    mapInstance = new maps.Map(container, defaultOptions);
    console.log('🗺️ Map instance created successfully');
    
    return mapInstance;
  } catch (error) {
    console.error('❌ Failed to create map instance:', error);
    throw error;
  }
};

// Get current map instance
export const getMapInstance = () => {
  return mapInstance;
};

// Create marker on map
export const createMarker = async (position, options = {}) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    const defaultOptions = {
      position,
      map: mapInstance,
      animation: maps.Animation.DROP,
      ...options
    };

    const marker = new maps.Marker(defaultOptions);
    return marker;
  } catch (error) {
    console.error('❌ Failed to create marker:', error);
    throw error;
  }
};

// Calculate distance between two points
export const calculateDistance = async (origin, destination) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    if (!maps.geometry || !maps.geometry.spherical) {
      throw new Error('Google Maps Geometry library not loaded');
    }

    const distance = maps.geometry.spherical.computeDistanceBetween(
      new maps.LatLng(origin.lat, origin.lng),
      new maps.LatLng(destination.lat, destination.lng)
    );

    return {
      meters: distance,
      kilometers: (distance / 1000).toFixed(1),
      formatted: distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`
    };
  } catch (error) {
    console.error('❌ Failed to calculate distance:', error);
    throw error;
  }
};

// Draw route polyline on map
export const drawRoutePolyline = async (route, options = {}) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    if (!route.overview_polyline || !route.overview_polyline.points) {
      throw new Error('Route polyline data not found');
    }

    // Decode polyline points
    const path = maps.geometry.encoding.decodePath(route.overview_polyline.points);
    
    const defaultOptions = {
      path: path,
      geodesic: true,
      strokeColor: '#4A90E2',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: mapInstance,
      ...options
    };

    const polyline = new maps.Polyline(defaultOptions);
    
    // Fit map to show entire route
    if (mapInstance) {
      const bounds = new maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      mapInstance.fitBounds(bounds);
    }

    return polyline;
  } catch (error) {
    console.error('❌ Failed to draw route polyline:', error);
    throw error;
  }
};

// Cleanup Google Maps resources
export const cleanupGoogleMaps = () => {
  if (mapInstance) {
    // Clear any overlays, markers, etc.
    mapInstance = null;
    console.log('🧹 Google Maps resources cleaned up');
  }
};

// Get API loading status
export const getGoogleMapsStatus = () => {
  return {
    isLoading,
    isLoaded,
    isConfigured: isAPIKeyConfigured(),
    isAvailable: !!(window.google && window.google.maps)
  };
};

// Utility function to check if maps are ready
export const waitForMapsReady = async (timeout = 10000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (window.google && window.google.maps) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error('Google Maps API not ready within timeout period');
};

// Enhanced error handler for maps-related errors
export const handleMapsError = (error, context = 'Google Maps') => {
  console.error(`❌ ${context} Error:`, error);
  
  // Return user-friendly error messages
  if (error.message.includes('key')) {
    return 'Google Maps API key is not configured or invalid. Please check your settings.';
  } else if (error.message.includes('quota') || error.message.includes('limit')) {
    return 'Google Maps API quota exceeded. Please try again later.';
  } else if (error.message.includes('timeout')) {
    return 'Google Maps is taking too long to load. Please check your internet connection.';
  } else if (error.message.includes('Network')) {
    return 'Unable to connect to Google Maps. Please check your internet connection.';
  } else {
    return `Google Maps error: ${error.message || 'Unknown error occurred'}`;
  }
};

// Export default initialization function
export default initializeGoogleMaps;
