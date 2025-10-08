import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const WAQI_API_TOKEN = import.meta.env.VITE_WAQI_API_TOKEN;

// Create axios instance for YOUR backend API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// BACKEND API CALLS (Correct Architecture)
// ========================================

// Enhanced Geocoding service - calls YOUR backend
export const geocodeAddress = async (address) => {
  try {
    console.log('🔍 Geocoding address via backend:', address);
    const response = await api.post('/routes/geocode', { address });
    
    if (response.data.status === 'success') {
      return {
        address: response.data.data.address,
        location: response.data.data.location,
        placeId: response.data.data.placeId,
        types: response.data.data.types || []
      };
    } else {
      throw new Error('Geocoding failed');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to server. Please check if backend is running.');
    }
    throw new Error('Unable to find location. Please try a different address.');
  }
};

// Enhanced Directions service - calls YOUR backend
export const getDirections = async (origin, destination, alternatives = true) => {
  try {
    console.log('🗺️ Getting directions via backend:', { origin, destination });
    
    const response = await api.post('/routes/plan', {
      origin: {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng),
        address: origin.address || `${origin.lat}, ${origin.lng}`
      },
      destination: {
        lat: parseFloat(destination.lat),
        lng: parseFloat(destination.lng),
        address: destination.address || `${destination.lat}, ${destination.lng}`
      },
      alternatives: alternatives
    });
    
    if (response.data.status === 'success' && response.data.data.routes) {
      console.log(`✅ Found ${response.data.data.routes.length} routes`);
      return response.data.data.routes;
    } else {
      throw new Error('No routes found');
    }
  } catch (error) {
    console.error('Directions error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to server. Please check if backend is running.');
    }
    throw new Error('Unable to calculate route. Please try again.');
  }
};

// Get route with air quality analysis - calls YOUR backend
export const getRouteWithAQI = async (origin, destination, alternatives = true) => {
  try {
    console.log('🌬️ Getting route with AQI analysis via backend');
    
    const routesResponse = await getDirections(origin, destination, alternatives);
    
    // The backend already includes AQI analysis in the routes
    return routesResponse.map(routeData => ({
      route: routeData.route,
      analysis: routeData.analysis || {
        breathabilityScore: calculateBreathabilityScore([]),
        healthImpact: { avgAQI: 0, riskLevel: 'unknown' },
        alerts: [],
        timeRecommendations: {}
      }
    }));
  } catch (error) {
    console.error('Route with AQI error:', error);
    throw error;
  }
};

// ========================================
// AUTHENTICATION API
// ========================================

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.post('/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }
};

// ========================================
// ROUTE API
// ========================================

export const routeAPI = {
  planRoute: async (routeData) => {
    try {
      const response = await api.post('/routes/plan', routeData);
      return response.data;
    } catch (error) {
      console.error('Plan route error:', error);
      throw error;
    }
  },

  geocode: async (address) => {
    try {
      const response = await api.post('/routes/geocode', { address });
      return response.data;
    } catch (error) {
      console.error('Geocode error:', error);
      throw error;
    }
  },

  getPopularRoutes: async () => {
    try {
      const response = await api.get('/routes/popular');
      return response.data;
    } catch (error) {
      console.error('Popular routes error:', error);
      throw error;
    }
  },

  getRouteStats: async () => {
    try {
      const response = await api.get('/routes/stats');
      return response.data;
    } catch (error) {
      console.error('Route stats error:', error);
      throw error;
    }
  }
};

// ========================================
// TRIP API
// ========================================

export const tripAPI = {
  createTrip: async (tripData) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      console.error('Create trip error:', error);
      throw error;
    }
  },

  getUserTrips: async (options = {}) => {
    try {
      const params = new URLSearchParams(options).toString();
      const response = await api.get(`/trips?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get user trips error:', error);
      throw error;
    }
  },

  getTrip: async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('Get trip error:', error);
      throw error;
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const response = await api.put(`/trips/${tripId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update trip error:', error);
      throw error;
    }
  },

  getTripStats: async (period = 'week') => {
    try {
      const response = await api.get(`/trips/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Trip stats error:', error);
      throw error;
    }
  },

  getTripInsights: async () => {
    try {
      const response = await api.get('/trips/insights');
      return response.data;
    } catch (error) {
      console.error('Trip insights error:', error);
      throw error;
    }
  }
};

// ========================================
// USER API
// ========================================

export const userAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/users/dashboard');
      return response.data;
    } catch (error) {
      console.error('Dashboard error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  getPreferences: async () => {
    try {
      const response = await api.get('/users/preferences');
      return response.data;
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/users/preferences', { preferences });
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }
};

// ========================================
// UTILITY FUNCTIONS (Keep these, they work fine)
// ========================================

// PRD-Compliant Breathability Score Calculation
export const calculateBreathabilityScore = (airQualityData) => {
  if (!airQualityData || airQualityData.length === 0) {
    return { score: 50, grade: 'N/A', avgAQI: 0, analysis: 'No data available' };
  }
  
  const avgAQI = airQualityData.reduce((sum, data) => sum + data.aqi, 0) / airQualityData.length;
  const maxAQI = Math.max(...airQualityData.map(d => d.aqi));
  const minAQI = Math.min(...airQualityData.map(d => d.aqi));
  
  let score, grade, analysis;
  
  if (avgAQI <= 50) {
    grade = 'A+';
    score = Math.floor(95 + (50 - avgAQI) / 10);
    analysis = 'Excellent air quality throughout the route';
  } else if (avgAQI <= 100) {
    grade = 'A';
    score = Math.floor(85 + (100 - avgAQI) / 10);
    analysis = 'Good air quality with minimal health concerns';
  } else if (avgAQI <= 150) {
    grade = 'B';
    score = Math.floor(70 + (150 - avgAQI) / 10);
    analysis = 'Moderate air quality, consider precautions for sensitive individuals';
  } else if (avgAQI <= 200) {
    grade = 'C';
    score = Math.floor(50 + (200 - avgAQI) / 10);
    analysis = 'Unhealthy air quality, take protective measures';
  } else if (avgAQI <= 300) {
    grade = 'D';
    score = Math.floor(30 + (300 - avgAQI) / 10);
    analysis = 'Very unhealthy air quality, avoid if possible';
  } else {
    grade = 'F';
    score = Math.floor(Math.max(0, 30 - (avgAQI - 300) / 10));
    analysis = 'Hazardous air quality, emergency conditions';
  }
  
  return { 
    score: Math.max(0, Math.min(100, score)), 
    grade, 
    avgAQI: Math.floor(avgAQI),
    maxAQI: Math.floor(maxAQI),
    minAQI: Math.floor(minAQI),
    analysis,
    variability: maxAQI - minAQI
  };
};

// Health impact calculation
export const calculateHealthImpact = (aqiData, userProfile = {}) => {
  if (!aqiData || aqiData.length === 0) return null;
  
  const avgAQI = aqiData.reduce((sum, d) => sum + d.aqi, 0) / aqiData.length;
  const maxAQI = Math.max(...aqiData.map(d => d.aqi));
  
  let riskMultiplier = 1;
  if (userProfile.hasRespiratoryConditions) riskMultiplier += 0.5;
  if (userProfile.hasHeartConditions) riskMultiplier += 0.4;
  if (userProfile.isPregnant) riskMultiplier += 0.3;
  if (userProfile.age > 65 || userProfile.age < 12) riskMultiplier += 0.2;
  
  const adjustedAQI = avgAQI * riskMultiplier;
  
  let recommendation = 'No special precautions needed';
  let riskLevel = 'low';
  
  if (adjustedAQI > 150) {
    recommendation = 'Use N95 mask, limit outdoor exposure, consider air purifier post-trip';
    riskLevel = 'high';
  } else if (adjustedAQI > 100) {
    recommendation = 'Consider face mask, close windows in high AQI areas';
    riskLevel = 'moderate';
  } else if (adjustedAQI > 50) {
    recommendation = 'Monitor air quality, stay hydrated';
    riskLevel = 'low';
  }
  
  return {
    avgAQI: Math.floor(avgAQI),
    adjustedAQI: Math.floor(adjustedAQI),
    maxAQI: Math.floor(maxAQI),
    riskLevel,
    recommendation,
    estimatedExposureTime: aqiData.length * 5 // Rough estimate in minutes
  };
};

// Export the main API instance
export default api;
