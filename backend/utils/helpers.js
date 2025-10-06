const moment = require('moment');

/**
 * Format duration from seconds to human readable format
 */
const formatDuration = (seconds) => {
  const duration = moment.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Format distance from meters to human readable format
 */
const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.floor(meters)} m`;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance * 1000; // Return in meters
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate AQI health impact score
 */
const calculateHealthScore = (aqi, userProfile = {}) => {
  let baseScore = 100;
  
  // AQI impact
  if (aqi > 300) baseScore -= 70;
  else if (aqi > 200) baseScore -= 50;
  else if (aqi > 150) baseScore -= 30;
  else if (aqi > 100) baseScore -= 15;
  else if (aqi > 50) baseScore -= 5;
  
  // User profile adjustments
  if (userProfile.hasRespiratoryConditions) baseScore -= 10;
  if (userProfile.hasHeartConditions) baseScore -= 8;
  if (userProfile.isPregnant) baseScore -= 6;
  if (userProfile.age > 65 || userProfile.age < 12) baseScore -= 5;
  
  return Math.max(0, Math.min(100, baseScore));
};

/**
 * Get AQI level and color
 */
const getAQILevel = (aqi) => {
  if (aqi <= 50) return { level: 'Good', color: '#00E400', grade: 'A+' };
  if (aqi <= 100) return { level: 'Moderate', color: '#FFFF00', grade: 'A' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#FF7E00', grade: 'B' };
  if (aqi <= 200) return { level: 'Unhealthy', color: '#FF0000', grade: 'C' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8F3F97', grade: 'D' };
  return { level: 'Hazardous', color: '#7E0023', grade: 'F' };
};

/**
 * Generate unique trip ID
 */
const generateTripId = () => {
  return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate coordinates
 */
const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Calculate route breathability score
 */
const calculateBreathabilityScore = (aqiDataPoints) => {
  if (!aqiDataPoints || aqiDataPoints.length === 0) {
    return { score: 0, grade: 'N/A', analysis: 'No data available' };
  }
  
  const avgAQI = aqiDataPoints.reduce((sum, point) => sum + point.aqi, 0) / aqiDataPoints.length;
  const maxAQI = Math.max(...aqiDataPoints.map(p => p.aqi));
  const minAQI = Math.min(...aqiDataPoints.map(p => p.aqi));
  
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

module.exports = {
  formatDuration,
  formatDistance,
  calculateDistance,
  calculateHealthScore,
  getAQILevel,
  generateTripId,
  isValidCoordinate,
  sanitizeInput,
  calculateBreathabilityScore
};
