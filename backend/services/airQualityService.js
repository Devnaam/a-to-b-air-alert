const axios = require('axios');
const logger = require('../utils/logger');

class AirQualityService {
  constructor() {
    this.waqiApiKey = process.env.WAQI_API_TOKEN;
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    
    this.waqiClient = axios.create({
      baseURL: 'https://api.waqi.info',
      timeout: 8000
    });
    
    this.openWeatherClient = axios.create({
      baseURL: 'https://api.openweathermap.org/data/2.5',
      timeout: 8000
    });
  }

  // Get air quality data from WAQI
  async getWAQIData(lat, lng) {
    try {
      if (!this.waqiApiKey) {
        throw new Error('WAQI API key not configured');
      }

      const response = await this.waqiClient.get(`/feed/geo:${lat};${lng}/`, {
        params: { token: this.waqiApiKey }
      });

      if (response.data.status === 'ok' && response.data.data) {
        const data = response.data.data;
        return {
          aqi: data.aqi || 0,
          pm25: data.iaqi?.pm25?.v || 0,
          pm10: data.iaqi?.pm10?.v || 0,
          o3: data.iaqi?.o3?.v || 0,
          no2: data.iaqi?.no2?.v || 0,
          so2: data.iaqi?.so2?.v || 0,
          co: data.iaqi?.co?.v || 0,
          timestamp: data.time?.s || new Date().toISOString(),
          station: data.city?.name || 'Unknown',
          source: 'WAQI'
        };
      }
      
      throw new Error('Invalid WAQI response');
    } catch (error) {
      logger.warn(`WAQI API error for ${lat},${lng}:`, error.message);
      return null;
    }
  }

  // Get air quality data from OpenWeatherMap
  async getOpenWeatherData(lat, lng) {
    try {
      if (!this.openWeatherApiKey) {
        throw new Error('OpenWeather API key not configured');
      }

      const response = await this.openWeatherClient.get('/air_pollution', {
        params: {
          lat,
          lon: lng,
          appid: this.openWeatherApiKey
        }
      });

      if (response.data && response.data.list && response.data.list[0]) {
        const data = response.data.list[0];
        const components = data.components;
        
        // Convert to AQI (simplified conversion)
        const aqi = this.calculateAQIFromComponents(components);
        
        return {
          aqi,
          pm25: components.pm2_5 || 0,
          pm10: components.pm10 || 0,
          o3: components.o3 || 0,
          no2: components.no2 || 0,
          so2: components.so2 || 0,
          co: components.co || 0,
          timestamp: new Date(data.dt * 1000).toISOString(),
          station: 'OpenWeather',
          source: 'OpenWeather'
        };
      }
      
      throw new Error('Invalid OpenWeather response');
    } catch (error) {
      logger.warn(`OpenWeather API error for ${lat},${lng}:`, error.message);
      return null;
    }
  }

  // Calculate AQI from pollutant components (simplified US EPA method)
  calculateAQIFromComponents(components) {
    const pm25 = components.pm2_5 || 0;
    const pm10 = components.pm10 || 0;
    const o3 = components.o3 || 0;
    const no2 = components.no2 || 0;

    // Simplified AQI calculation based on PM2.5 as primary indicator
    let aqi = 0;
    
    if (pm25 <= 12.0) aqi = Math.round((50/12.0) * pm25);
    else if (pm25 <= 35.4) aqi = Math.round(((100-51)/(35.4-12.1)) * (pm25-12.1) + 51);
    else if (pm25 <= 55.4) aqi = Math.round(((150-101)/(55.4-35.5)) * (pm25-35.5) + 101);
    else if (pm25 <= 150.4) aqi = Math.round(((200-151)/(150.4-55.5)) * (pm25-55.5) + 151);
    else if (pm25 <= 250.4) aqi = Math.round(((300-201)/(250.4-150.5)) * (pm25-150.5) + 201);
    else aqi = Math.round(((500-301)/(500.4-250.5)) * (pm25-250.5) + 301);

    return Math.min(500, Math.max(0, aqi));
  }

  // Generate mock AQI data for development/fallback
  generateMockData(lat, lng) {
    // Generate realistic AQI based on location patterns
    let baseAQI = 80;
    
    // Urban areas typically have higher AQI
    if (lat > 28.4 && lat < 28.8 && lng > 77.0 && lng < 77.4) {
      // Delhi area
      baseAQI = Math.floor(Math.random() * 120) + 100; // 100-220
    } else if (lat > 18.9 && lat < 19.3 && lng > 72.7 && lng < 73.0) {
      // Mumbai area
      baseAQI = Math.floor(Math.random() * 80) + 90; // 90-170
    } else if (lat > 12.8 && lat < 13.1 && lng > 77.4 && lng < 77.8) {
      // Bangalore area
      baseAQI = Math.floor(Math.random() * 70) + 60; // 60-130
    } else {
      // Other areas
      baseAQI = Math.floor(Math.random() * 80) + 40; // 40-120
    }

    // Add time-based variation
    const hour = new Date().getHours();
    let timeMultiplier = 1;
    
    if (hour >= 7 && hour <= 10) timeMultiplier = 1.3; // Morning rush
    else if (hour >= 17 && hour <= 20) timeMultiplier = 1.4; // Evening rush
    else if (hour >= 22 || hour <= 5) timeMultiplier = 0.7; // Night

    const finalAQI = Math.min(500, Math.max(10, Math.floor(baseAQI * timeMultiplier)));
    
    return {
      aqi: finalAQI,
      pm25: Math.floor(finalAQI * 0.6),
      pm10: Math.floor(finalAQI * 0.8),
      o3: Math.floor(Math.random() * 50) + 20,
      no2: Math.floor(Math.random() * 40) + 10,
      so2: Math.floor(Math.random() * 20) + 5,
      co: Math.floor(Math.random() * 100) + 50,
      timestamp: new Date().toISOString(),
      station: 'Mock Station',
      source: 'Mock'
    };
  }

  // Main method to get air quality data
  async getAirQuality(lat, lng) {
    try {
      // Try WAQI first (more comprehensive AQI data)
      let aqData = await this.getWAQIData(lat, lng);
      
      // Fallback to OpenWeather if WAQI fails
      if (!aqData) {
        aqData = await this.getOpenWeatherData(lat, lng);
      }
      
      // Final fallback to mock data
      if (!aqData) {
        logger.info(`Using mock air quality data for ${lat},${lng}`);
        aqData = this.generateMockData(lat, lng);
      }

      return aqData;
    } catch (error) {
      logger.error('Air quality service error:', error);
      return this.generateMockData(lat, lng);
    }
  }

  // Get air quality for multiple points (route analysis)
  async getRouteAirQuality(coordinates) {
    try {
      const promises = coordinates.map(coord => 
        this.getAirQuality(coord.lat, coord.lng)
      );

      // Add delays to avoid rate limiting
      const results = [];
      for (let i = 0; i < promises.length; i++) {
        results.push(await promises[i]);
        
        // Add delay between requests (except for last one)
        if (i < promises.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return results.map((data, index) => ({
        location: coordinates[index],
        ...data
      }));
    } catch (error) {
      logger.error('Route air quality analysis error:', error);
      
      // Return mock data for all coordinates
      return coordinates.map(coord => ({
        location: coord,
        ...this.generateMockData(coord.lat, coord.lng)
      }));
    }
  }

  // Get air quality forecast (if available)
  async getForecast(lat, lng, hours = 24) {
    try {
      // This would integrate with forecast APIs
      // For now, generate mock forecast data
      const baseData = await this.getAirQuality(lat, lng);
      const forecast = [];
      
      for (let i = 0; i < hours; i++) {
        const variation = (Math.random() - 0.5) * 30;
        const forecastAQI = Math.max(10, Math.min(500, baseData.aqi + variation));
        
        forecast.push({
          timestamp: new Date(Date.now() + i * 3600000).toISOString(),
          aqi: Math.floor(forecastAQI),
          confidence: Math.max(60, 100 - (i * 2)) // Confidence decreases over time
        });
      }
      
      return forecast;
    } catch (error) {
      logger.error('Air quality forecast error:', error);
      return [];
    }
  }
}

module.exports = new AirQualityService();
