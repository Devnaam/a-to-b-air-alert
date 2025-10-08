// Google Maps API loader utility - Complete version with all required functions

let isLoading = false;
let isLoaded = false;
let loadPromise = null;
let mapInstance = null;

// Check if Google Maps API key is configured
const isAPIKeyConfigured = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return apiKey && apiKey !== 'your_google_maps_api_key_here_optional' && apiKey.length > 10;
};

// Google Maps API loader
export const loadGoogleMapsAPI = () => {
  if (loadPromise) {
    return loadPromise;
  }

  if (window.google && window.google.maps && window.google.maps.Map) {
    isLoaded = true;
    console.log('✅ Google Maps API already loaded');
    return Promise.resolve(window.google.maps);
  }

  if (!isAPIKeyConfigured()) {
    console.warn('⚠️ Google Maps API key not configured');
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  isLoading = true;
  console.log('🔄 Loading Google Maps API...');

  loadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('🔄 Google Maps script already exists, waiting for load...');
      
      let attempts = 0;
      const maxAttempts = 100;
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(checkInterval);
          isLoaded = true;
          isLoading = false;
          console.log('✅ Google Maps API loaded from existing script');
          resolve(window.google.maps);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          isLoading = false;
          reject(new Error('Google Maps API loading timeout'));
        }
      }, 100);
      
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.type = 'text/javascript';
    script.id = 'google-maps-api-script';
    
    window.initGoogleMaps = () => {
      console.log('📜 Google Maps callback triggered');
      
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          isLoaded = true;
          isLoading = false;
          console.log('✅ Google Maps API loaded successfully');
          delete window.initGoogleMaps;
          resolve(window.google.maps);
        } else {
          isLoading = false;
          console.error('❌ Google Maps API objects not available');
          reject(new Error('Google Maps API core services not available'));
        }
      }, 100);
    };
    
    script.onerror = (event) => {
      isLoading = false;
      delete window.initGoogleMaps;
      const error = new Error(`Failed to load Google Maps API: ${event.message || 'Network error'}`);
      console.error('❌', error);
      reject(error);
    };
    
    setTimeout(() => {
      if (isLoading) {
        isLoading = false;
        delete window.initGoogleMaps;
        reject(new Error('Google Maps API loading timeout'));
      }
    }, 15000);
    
    document.head.appendChild(script);
    console.log('📜 Google Maps script added to DOM');
  });

  return loadPromise;
};

// Initialize Google Maps API
export const initializeGoogleMaps = async () => {
  try {
    if (!isAPIKeyConfigured()) {
      console.warn('⚠️ Google Maps API key not configured - skipping initialization');
      return false;
    }

    console.log('🚀 Initializing Google Maps API...');
    const maps = await loadGoogleMapsAPI();
    
    const requiredServices = ['Map', 'Marker', 'LatLng', 'InfoWindow'];
    const missingServices = requiredServices.filter(service => !maps[service]);
    
    if (missingServices.length > 0) {
      throw new Error(`Google Maps services not available: ${missingServices.join(', ')}`);
    }
    
    if (!window.google.maps.geometry) {
      console.warn('⚠️ Google Maps Geometry library not loaded');
    }
    
    console.log('✅ Google Maps API initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Google Maps API:', error);
    return false;
  }
};

// Create a map instance
export const createMapInstance = async (container, options = {}) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    if (!container) {
      throw new Error('Map container element is required');
    }

    const defaultOptions = {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
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

// Create marker - THIS WAS MISSING
export const createMarker = async (position, options = {}) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    if (!maps.Marker) {
      throw new Error('Google Maps Marker class not available');
    }

    const defaultOptions = {
      position,
      map: mapInstance,
      ...options
    };

    const marker = new maps.Marker(defaultOptions);
    console.log('📍 Marker created successfully');
    return marker;
  } catch (error) {
    console.error('❌ Failed to create marker:', error);
    throw error;
  }
};

// Draw route polyline - THIS WAS MISSING
export const drawRoutePolyline = async (route, options = {}) => {
  try {
    const maps = await loadGoogleMapsAPI();
    
    if (!route.overview_polyline || !route.overview_polyline.points) {
      throw new Error('Route polyline data not found');
    }

    if (!maps.geometry || !maps.geometry.encoding) {
      throw new Error('Google Maps Geometry library not loaded');
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
    if (mapInstance && path.length > 0) {
      const bounds = new maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      mapInstance.fitBounds(bounds);
    }

    console.log('🖍️ Route polyline drawn successfully');
    return polyline;
  } catch (error) {
    console.error('❌ Failed to draw route polyline:', error);
    
    // Return a mock polyline object to prevent errors
    return {
      setMap: (map) => console.log('Mock polyline setMap called'),
      getPath: () => [],
      setVisible: (visible) => console.log('Mock polyline setVisible called')
    };
  }
};

// Get API loading status
export const getGoogleMapsStatus = () => {
  return {
    isLoading,
    isLoaded,
    isConfigured: isAPIKeyConfigured(),
    isAvailable: !!(window.google && window.google.maps && window.google.maps.Map),
    apiKey: isAPIKeyConfigured() ? 'Configured' : 'Not configured'
  };
};

// Optional initialization
export const initializeGoogleMapsOptional = async () => {
  try {
    return await initializeGoogleMaps();
  } catch (error) {
    console.warn('🟨 Google Maps initialization failed but app will continue:', error.message);
    return false;
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

// Cleanup function
export const cleanupGoogleMaps = () => {
  if (mapInstance) {
    mapInstance = null;
    console.log('🧹 Google Maps resources cleaned up');
  }
};

// Check if maps can be used
export const canUseGoogleMaps = () => {
  return isAPIKeyConfigured() && isLoaded;
};

export default initializeGoogleMapsOptional;
