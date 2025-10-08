const mapsService = require('../services/mapsService');
const routeAnalysisService = require('../services/routeAnalysisService');
const Route = require('../models/Route');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Plan route with air quality analysis
exports.planRoute = asyncHandler(async (req, res) => {
  const { origin, destination, alternatives = true, avoidTolls = false, departureTime } = req.body;
  const userProfile = req.user?.health_profile || {};

  try {
    // Get route directions
    const routes = await mapsService.getDirections(origin, destination, {
      alternatives,
      avoidTolls,
      departureTime: departureTime ? new Date(departureTime) : null
    });

    if (!routes || routes.length === 0) {
      throw new AppError('No routes found between these locations', 404);
    }

    // Analyze routes with air quality data
    const analysis = await routeAnalysisService.compareRoutes(routes, userProfile);

    // Cache popular routes
    if (req.user) {
      // Don't await this - let it run in background
      setImmediate(async () => {
        try {
          for (const routeAnalysis of analysis.routes) {
            const routeHash = routeAnalysis.routeId;
            const existingRoute = await Route.findByHash(routeHash);
            
            if (existingRoute) {
              await Route.updateUsage(existingRoute.id, routeAnalysis.airQualityData);
            } else {
              await Route.create({
                origin,
                destination,
                routeHash,
                distance: routeAnalysis.route.legs[0].distance.value,
                duration: routeAnalysis.route.legs[0].duration.value,
                airQualityData: routeAnalysis.airQualityData,
                breathabilityScore: routeAnalysis.breathabilityScore
              });
            }
          }
        } catch (error) {
          logger.error('Route caching error:', error);
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        routes: analysis.routes.map(routeAnalysis => ({
          route: routeAnalysis.route,
          analysis: {
            breathabilityScore: routeAnalysis.breathabilityScore,
            healthImpact: routeAnalysis.healthImpact,
            alerts: routeAnalysis.alerts,
            timeRecommendations: routeAnalysis.timeRecommendations
          }
        })),
        recommendation: analysis.recommendation,
        timestamp: analysis.comparisonTimestamp
      }
    });
  } catch (error) {
    logger.error('Route planning error:', error);
    throw error;
  }
});

// Get cached route analysis
exports.getCachedRoute = asyncHandler(async (req, res) => {
  const { routeHash } = req.params;

  const cachedRoute = await Route.findByHash(routeHash);
  
  if (!cachedRoute) {
    throw new AppError('Cached route not found', 404);
  }

  // Update usage count
  await Route.updateUsage(cachedRoute.id);

  res.status(200).json({
    status: 'success',
    data: {
      route: cachedRoute,
      cached: true,
      lastUpdated: cachedRoute.updated_at
    }
  });
});

// Geocode address
exports.geocode = asyncHandler(async (req, res) => {
  const { address } = req.body;

  if (!address) {
    throw new AppError('Address is required', 400);
  }

  try {
    const result = await mapsService.geocode(address);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Geocoding error:', error);
    throw new AppError('Failed to geocode address', 400);
  }
});

// Reverse geocode coordinates
exports.reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  try {
    const result = await mapsService.reverseGeocode(lat, lng);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Reverse geocoding error:', error);
    throw new AppError('Failed to reverse geocode coordinates', 400);
  }
});

// Get popular routes
exports.getPopularRoutes = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const popularRoutes = await Route.getPopular(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      routes: popularRoutes,
      count: popularRoutes.length
    }
  });
});

// Analyze single route (for route updates during navigation)
exports.analyzeRoute = asyncHandler(async (req, res) => {
  const { routeData } = req.body;
  const userProfile = req.user?.health_profile || {};

  if (!routeData) {
    throw new AppError('Route data is required', 400);
  }

  try {
    const analysis = await routeAnalysisService.analyzeRoute(routeData, userProfile);

    res.status(200).json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    logger.error('Route analysis error:', error);
    throw error;
  }
});

// Get time-based route recommendations
exports.getTimeRecommendations = asyncHandler(async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    throw new AppError('Origin and destination are required', 400);
  }

  try {
    // Get a sample route for analysis
    const routes = await mapsService.getDirections(origin, destination, { alternatives: false });
    
    if (!routes || routes.length === 0) {
      throw new AppError('No routes found for time analysis', 404);
    }

    const analysis = await routeAnalysisService.analyzeRoute(routes[0], req.user?.health_profile || {});

    res.status(200).json({
      status: 'success',
      data: {
        timeRecommendations: analysis.timeRecommendations,
        currentConditions: analysis.timeRecommendations.currentConditions
      }
    });
  } catch (error) {
    logger.error('Time recommendations error:', error);
    throw error;
  }
});

// Add this to your routeController.js exports
// Make sure this function exists in your routeController.js
exports.reverseGeocode = asyncHandler(async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw new AppError('Valid latitude and longitude are required', 400);
    }

    console.log(`🔄 Reverse geocoding coordinates: ${lat}, ${lng}`);
    
    const result = await mapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
    
    console.log('✅ Reverse geocoding result:', result);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Reverse geocoding controller error:', error);
    throw error;
  }
});



// Get route statistics
exports.getRouteStats = asyncHandler(async (req, res) => {
  const stats = await Route.getStats();

  res.status(200).json({
    status: 'success',
    data: stats
  });
});
