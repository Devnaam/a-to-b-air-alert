const Trip = require('../models/Trip');
const User = require('../models/User');
const routeAnalysisService = require('../services/routeAnalysisService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Create new trip
exports.createTrip = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    origin,
    destination,
    routeData,
    airQualityData,
    breathabilityScore,
    routeType
  } = req.body;

  try {
    const trip = await Trip.create(userId, {
      origin,
      destination,
      routeData,
      airQualityData,
      breathabilityScore,
      routeType
    });

    logger.info(`Trip created: ${trip.id} for user ${userId}`);

    res.status(201).json({
      status: 'success',
      message: 'Trip created successfully',
      data: {
        trip
      }
    });
  } catch (error) {
    logger.error('Trip creation error:', error);
    throw error;
  }
});

// Get user's trips
exports.getUserTrips = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    limit = 20,
    offset = 0,
    status,
    startDate,
    endDate,
    routeType
  } = req.query;

  const options = {
    limit: parseInt(limit),
    offset: parseInt(offset),
    status,
    routeType,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  };

  const trips = await Trip.findByUserId(userId, options);

  // Get total count for pagination
  const totalQuery = await Trip.findByUserId(userId, { ...options, limit: 1000, offset: 0 });
  const total = totalQuery.length;

  res.status(200).json({
    status: 'success',
    data: {
      trips,
      pagination: {
        total,
        limit: options.limit,
        offset: options.offset,
        hasMore: total > (options.offset + options.limit)
      }
    }
  });
});

// Get specific trip
exports.getTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Check if trip belongs to user
  if (trip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    status: 'success',
    data: {
      trip
    }
  });
});

// Update trip (status, notes, actual data)
exports.updateTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  // Verify trip belongs to user
  const existingTrip = await Trip.findById(tripId);
  if (!existingTrip) {
    throw new AppError('Trip not found', 404);
  }

  if (existingTrip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  const updatedTrip = await Trip.update(tripId, updates);

  logger.info(`Trip updated: ${tripId} by user ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'Trip updated successfully',
    data: {
      trip: updatedTrip
    }
  });
});

// Start trip (change status to in_progress)
exports.startTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  if (trip.status !== 'planned') {
    throw new AppError('Trip cannot be started from current status', 400);
  }

  const updatedTrip = await Trip.update(tripId, { status: 'in_progress' });

  logger.info(`Trip started: ${tripId} by user ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'Trip started successfully',
    data: {
      trip: updatedTrip
    }
  });
});

// Complete trip
exports.completeTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { actualDuration, actualDistance, healthActions, notes } = req.body;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  if (trip.status !== 'in_progress') {
    throw new AppError('Trip must be in progress to complete', 400);
  }

  const updateData = {
    status: 'completed',
    actualDuration,
    actualDistance,
    healthActions,
    notes
  };

  const updatedTrip = await Trip.update(tripId, updateData);

  logger.info(`Trip completed: ${tripId} by user ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'Trip completed successfully',
    data: {
      trip: updatedTrip
    }
  });
});

// Cancel trip
exports.cancelTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  if (trip.status === 'completed') {
    throw new AppError('Cannot cancel completed trip', 400);
  }

  const updatedTrip = await Trip.update(tripId, { status: 'cancelled' });

  logger.info(`Trip cancelled: ${tripId} by user ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'Trip cancelled successfully',
    data: {
      trip: updatedTrip
    }
  });
});

// Delete trip
exports.deleteTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  const deleted = await Trip.delete(tripId);
  if (!deleted) {
    throw new AppError('Failed to delete trip', 500);
  }

  logger.info(`Trip deleted: ${tripId} by user ${userId}`);

  res.status(200).json({
    status: 'success',
    message: 'Trip deleted successfully'
  });
});

// Get trip statistics for user
exports.getTripStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = 'week' } = req.query;

  const stats = await Trip.getUserTripStats(userId, period);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      period
    }
  });
});

// Get exposure analysis for user
exports.getExposureAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = 'week' } = req.query;

  const exposureAnalysis = await Trip.getExposureAnalysis(userId, period);

  res.status(200).json({
    status: 'success',
    data: {
      exposureAnalysis,
      period
    }
  });
});

// Get trip insights and recommendations
exports.getTripInsights = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get recent trips for analysis
  const recentTrips = await Trip.findByUserId(userId, { limit: 10, status: 'completed' });
  
  if (recentTrips.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        insights: {
          message: 'Complete some trips to see personalized insights',
          recommendations: []
        }
      }
    });
  }

  // Calculate insights
  const totalExposure = recentTrips.reduce((sum, trip) => sum + trip.average_aqi, 0);
  const avgExposure = totalExposure / recentTrips.length;
  
  const healthyRouteCount = recentTrips.filter(trip => trip.route_type === 'healthiest').length;
  const healthyRoutePercentage = (healthyRouteCount / recentTrips.length) * 100;
  
  const highExposureTrips = recentTrips.filter(trip => trip.average_aqi > 150);
  
  // Generate recommendations
  const recommendations = [];
  
  if (avgExposure > 120) {
    recommendations.push({
      type: 'route-optimization',
      priority: 'high',
      message: 'Your average exposure is high. Consider choosing healthier routes more often.',
      action: 'Select "Healthiest Route" option when planning trips'
    });
  }
  
  if (healthyRoutePercentage < 50) {
    recommendations.push({
      type: 'route-preference',
      priority: 'medium',
      message: 'You\'ve chosen healthy routes in only ' + Math.round(healthyRoutePercentage) + '% of trips.',
      action: 'Try the healthiest route option to reduce exposure'
    });
  }
  
  if (highExposureTrips.length > 0) {
    recommendations.push({
      type: 'time-optimization',
      priority: 'medium',
      message: `${highExposureTrips.length} recent trips had high air quality exposure.`,
      action: 'Use time-of-day intelligence to find better travel times'
    });
  }
  
  // Positive reinforcement
  if (healthyRoutePercentage >= 70) {
    recommendations.push({
      type: 'positive',
      priority: 'info',
      message: 'Great job! You\'re consistently choosing healthier routes.',
      action: 'Keep up the healthy travel habits'
    });
  }

  const insights = {
    summary: {
      totalTrips: recentTrips.length,
      avgExposure: Math.round(avgExposure),
      healthyRoutePercentage: Math.round(healthyRoutePercentage),
      improvementTrend: avgExposure < 100 ? 'improving' : avgExposure > 150 ? 'concerning' : 'stable'
    },
    recommendations,
    weeklyTrend: await calculateWeeklyTrend(userId),
    topRoutes: await getTopRoutes(recentTrips)
  };

  res.status(200).json({
    status: 'success',
    data: {
      insights
    }
  });
});

// Helper function to calculate weekly trend
const calculateWeeklyTrend = async (userId) => {
  try {
    const thisWeekStats = await Trip.getUserTripStats(userId, 'week');
    
    // Get previous week for comparison (simplified)
    const trend = {
      trips: thisWeekStats.totalTrips,
      avgAQI: thisWeekStats.avgAQI,
      comparison: 'stable' // Could be enhanced with actual comparison logic
    };
    
    return trend;
  } catch (error) {
    logger.error('Weekly trend calculation error:', error);
    return null;
  }
};

// Helper function to get top routes
const getTopRoutes = (trips) => {
  const routeCounts = {};
  
  trips.forEach(trip => {
    const routeKey = `${trip.origin_address} → ${trip.destination_address}`;
    if (!routeCounts[routeKey]) {
      routeCounts[routeKey] = {
        route: routeKey,
        count: 0,
        avgAQI: 0,
        totalAQI: 0
      };
    }
    routeCounts[routeKey].count++;
    routeCounts[routeKey].totalAQI += trip.average_aqi;
  });
  
  // Calculate averages and sort by frequency
  const topRoutes = Object.values(routeCounts)
    .map(route => ({
      ...route,
      avgAQI: Math.round(route.totalAQI / route.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  return topRoutes;
};

// Update trip air quality during navigation
exports.updateTripAirQuality = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { airQualityData, currentLocation } = req.body;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  if (trip.status !== 'in_progress') {
    throw new AppError('Trip must be in progress to update air quality', 400);
  }

  // Update trip with new air quality data
  const updatedTrip = await Trip.update(tripId, {
    airQualityData: [...trip.air_quality_data, ...airQualityData]
  });

  // Generate new alerts for current conditions
  const userProfile = req.user.health_profile || {};
  const alerts = routeAnalysisService.generateProactiveAlerts(airQualityData, userProfile);

  res.status(200).json({
    status: 'success',
    message: 'Trip air quality updated',
    data: {
      trip: updatedTrip,
      alerts,
      currentLocation
    }
  });
});
