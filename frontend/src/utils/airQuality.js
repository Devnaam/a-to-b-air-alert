// PRD-Compliant AQI level definitions and colors
export const AQI_LEVELS = {
  GOOD: { 
    min: 0, 
    max: 50, 
    label: 'Good', 
    color: '#00E400', 
    bgColor: '#E8F5E8',
    textColor: 'white'
  },
  MODERATE: { 
    min: 51, 
    max: 100, 
    label: 'Moderate', 
    color: '#FFFF00', 
    bgColor: '#FFFBCC',
    textColor: '#333333'
  },
  UNHEALTHY_SENSITIVE: { 
    min: 101, 
    max: 150, 
    label: 'Unhealthy for Sensitive', 
    color: '#FF7E00', 
    bgColor: '#FFE4CC',
    textColor: 'white'
  },
  UNHEALTHY: { 
    min: 151, 
    max: 200, 
    label: 'Unhealthy', 
    color: '#FF0000', 
    bgColor: '#FFCCCC',
    textColor: 'white'
  },
  VERY_UNHEALTHY: { 
    min: 201, 
    max: 300, 
    label: 'Very Unhealthy', 
    color: '#8F3F97', 
    bgColor: '#E4CCE0',
    textColor: 'white'
  },
  HAZARDOUS: { 
    min: 301, 
    max: 500, 
    label: 'Hazardous', 
    color: '#7E0023', 
    bgColor: '#DECCCE',
    textColor: 'white'
  }
};

export const getAQILevel = (aqi) => {
  for (const [key, level] of Object.entries(AQI_LEVELS)) {
    if (aqi >= level.min && aqi <= level.max) {
      return level;
    }
  }
  return AQI_LEVELS.HAZARDOUS; // Default to hazardous for values > 500
};

export const getAQIColor = (aqi) => {
  return getAQILevel(aqi).color;
};

export const getAQIBackgroundColor = (aqi) => {
  return getAQILevel(aqi).bgColor;
};

export const getAQITextColor = (aqi) => {
  return getAQILevel(aqi).textColor;
};

export const getAQILabel = (aqi) => {
  return getAQILevel(aqi).label;
};

// Health recommendations based on AQI
export const getHealthRecommendation = (aqi, isPregnant = false, hasRespiratory = false, age = 30) => {
  const level = getAQILevel(aqi);
  
  const baseRecommendations = {
    GOOD: {
      general: "Air quality is excellent. Perfect for outdoor activities.",
      sensitive: "Great conditions for everyone, including sensitive individuals."
    },
    MODERATE: {
      general: "Air quality is acceptable for most people.",
      sensitive: "Consider limiting prolonged outdoor activities if you're unusually sensitive."
    },
    UNHEALTHY_SENSITIVE: {
      general: "Consider reducing outdoor activities if you experience symptoms.",
      sensitive: "Limit outdoor activities. Consider wearing a mask if going outside."
    },
    UNHEALTHY: {
      general: "Avoid outdoor activities. Everyone may experience health effects.",
      sensitive: "Stay indoors. Use air purifiers if available."
    },
    VERY_UNHEALTHY: {
      general: "Avoid all outdoor activities. Health alert for everyone.",
      sensitive: "Stay indoors. Avoid physical activity. Consider postponing travel."
    },
    HAZARDOUS: {
      general: "Emergency conditions. Avoid all outdoor exposure.",
      sensitive: "Stay indoors. Emergency health warnings in effect."
    }
  };

  const isSensitive = isPregnant || hasRespiratory || age > 65 || age < 12;
  const recommendation = baseRecommendations[Object.keys(AQI_LEVELS).find(key => AQI_LEVELS[key] === level)];
  
  return isSensitive ? recommendation.sensitive : recommendation.general;
};

// Format time duration
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Format distance
export const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.floor(meters)} m`;
};
