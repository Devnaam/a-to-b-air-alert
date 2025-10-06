const axios = require('axios');
const logger = require('../utils/logger');
const { calculateDistance } = require('../utils/helpers');

class MapsService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    this.client = axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api',
      timeout: 10000
    });
  }

  // Geocode an address to coordinates
  async geocode(address) {
    try {
      if (!this.googleApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await this.client.get('/geocode/json', {
        params: {
          address: address,
          key: this.googleApiKey,
          components: 'country:IN', // Restrict to India
          language: 'en'
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          address: result.formatted_address,
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          },
          placeId: result.place_id,
          types: result.types,
          bounds: result.geometry.bounds
        };
      } else if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Location not found. Please try a more specific address.');
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      logger.error('Geocoding error:', error.message);
      throw error;
    }
  }

  // Get directions between two points
  async getDirections(origin, destination, options = {}) {
    try {
      if (!this.googleApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const {
        alternatives = true,
        avoidTolls = false,
        departureTime = null,
        travelMode = 'driving'
      } = options;

      const params = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        alternatives: alternatives,
        key: this.googleApiKey,
        mode: travelMode,
        units: 'metric',
        language: 'en'
      };

      if (avoidTolls) {
        params.avoid = 'tolls';
      }

      if (departureTime) {
        params.departure_time = Math.floor(departureTime.getTime() / 1000);
      }

      const response = await this.client.get('/directions/json', { params });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        return response.data.routes.map(route => ({
          ...route,
          routeId: this.generateRouteHash(origin, destination, route)
        }));
      } else if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('No routes found between these locations.');
      } else {
        throw new Error(`Directions failed: ${response.data.status}`);
      }
    } catch (error) {
      logger.error('Directions error:', error.message);
      throw error;
    }
  }

  // Generate a hash for route caching
  generateRouteHash(origin, destination, route) {
    const crypto = require('crypto');
    const routeString = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${route.summary}`;
    return crypto.createHash('sha256').update(routeString).digest('hex').substring(0, 16);
  }

  // Get route coordinates for air quality sampling
  getRouteCoordinates(route, maxPoints = 10) {
    try {
      if (!route.legs || route.legs.length === 0) {
        return [];
      }

      const coordinates = [];
      const steps = route.legs[0].steps;
      
      // Always include start and end points
      coordinates.push({
        lat: steps[0].start_location.lat,
        lng: steps[0].start_location.lng
      });

      // Sample intermediate points
      const sampleInterval = Math.max(1, Math.floor(steps.length / (maxPoints - 2)));
      
      for (let i = sampleInterval; i < steps.length; i += sampleInterval) {
        coordinates.push({
          lat: steps[i].start_location.lat,
          lng: steps[i].start_location.lng
        });
      }

      // Add end point
      const lastStep = steps[steps.length - 1];
      coordinates.push({
        lat: lastStep.end_location.lat,
        lng: lastStep.end_location.lng
      });

      return coordinates;
    } catch (error) {
      logger.error('Error extracting route coordinates:', error);
      return [];
    }
  }

  // Generate mock directions for development/fallback
  generateMockDirections(origin, destination, alternatives = true) {
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const baseTime = Math.floor(distance * 2); // 2 minutes per km estimate
    
    const routes = [];
    
    // Generate primary route (fastest)
    routes.push(this.createMockRoute(origin, destination, {
      summary: 'Fastest Route',
      distance: distance,
      duration: baseTime * 60,
      routeType: 'fastest'
    }));

    // Generate alternative route (healthiest) if requested
    if (alternatives) {
      routes.push(this.createMockRoute(origin, destination, {
        summary: 'Healthiest Route',
        distance: distance * 1.15, // 15% longer
        duration: baseTime * 60 * 1.2, // 20% more time
        routeType: 'healthiest'
      }));
    }

    return routes;
  }

  // Create mock route object
  createMockRoute(origin, destination, options) {
    const steps = this.generateMockSteps(origin, destination, 8);
    
    return {
      routeId: this.generateRouteHash(origin, destination, { summary: options.summary }),
      bounds: {
        northeast: {
          lat: Math.max(origin.lat, destination.lat) + 0.01,
          lng: Math.max(origin.lng, destination.lng) + 0.01
        },
        southwest: {
          lat: Math.min(origin.lat, destination.lat) - 0.01,
          lng: Math.min(origin.lng, destination.lng) - 0.01
        }
      },
      legs: [{
        distance: {
          text: `${(options.distance).toFixed(1)} km`,
          value: Math.floor(options.distance * 1000)
        },
        duration: {
          text: this.formatDuration(options.duration),
          value: options.duration
        },
        start_location: origin,
        end_location: destination,
        start_address: 'Starting Point',
        end_address: 'Destination',
        steps: steps
      }],
      overview_polyline: {
        points: `mock_${origin.lat}_${origin.lng}_${destination.lat}_${destination.lng}`
      },
      summary: options.summary,
      warnings: [],
      waypoint_order: []
    };
  }

  // Generate mock route steps
  generateMockSteps(origin, destination, numSteps) {
    const steps = [];
    
    for (let i = 0; i < numSteps; i++) {
      const progress = i / (numSteps - 1);
      const lat = origin.lat + (destination.lat - origin.lat) * progress;
      const lng = origin.lng + (destination.lng - origin.lng) * progress;
      
      steps.push({
        distance: {
          text: '0.5 km',
          value: 500
        },
        duration: {
          text: '2 min',
          value: 120
        },
        start_location: { lat, lng },
        end_location: { 
          lat: lat + (destination.lat - origin.lat) / numSteps, 
          lng: lng + (destination.lng - origin.lng) / numSteps 
        },
        html_instructions: i === 0 ? 'Head towards destination' : 
                          i === numSteps - 1 ? 'Arrive at destination' : 
                          'Continue straight',
        travel_mode: 'DRIVING'
      });
    }
    
    return steps;
  }

  // Format duration helper
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      if (!this.googleApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await this.client.get('/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: this.googleApiKey,
          language: 'en'
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          address: result.formatted_address,
          components: result.address_components,
          types: result.types
        };
      }
      
      throw new Error('Address not found');
    } catch (error) {
      logger.error('Reverse geocoding error:', error.message);
      return {
        address: `${lat}, ${lng}`,
        components: [],
        types: ['approximate']
      };
    }
  }
}

module.exports = new MapsService();
