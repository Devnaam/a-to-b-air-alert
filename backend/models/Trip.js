const db = require('../config/database');
const { generateTripId, calculateBreathabilityScore } = require('../utils/helpers');

class Trip {
  // Create new trip
  static async create(userId, tripData) {
    const {
      origin,
      destination,
      routeData,
      airQualityData,
      breathabilityScore,
      routeType
    } = tripData;

    const tripId = generateTripId();
    
    const [trip] = await db('trips')
      .insert({
        id: tripId,
        user_id: userId,
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        origin_address: origin.address,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        destination_address: destination.address,
        route_data: JSON.stringify(routeData),
        air_quality_data: JSON.stringify(airQualityData || []),
        breathability_score: JSON.stringify(breathabilityScore || {}),
        route_type: routeType,
        distance_meters: routeData.legs?.[0]?.distance?.value || 0,
        duration_seconds: routeData.legs?.[0]?.duration?.value || 0,
        average_aqi: breathabilityScore?.avgAQI || 0,
        max_aqi: breathabilityScore?.maxAQI || 0,
        min_aqi: breathabilityScore?.minAQI || 0,
        status: 'planned',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    // Parse JSON fields for return
    trip.route_data = JSON.parse(trip.route_data || '{}');
    trip.air_quality_data = JSON.parse(trip.air_quality_data || '[]');
    trip.breathability_score = JSON.parse(trip.breathability_score || '{}');
    trip.health_actions = JSON.parse(trip.health_actions || '[]');

    return trip;
  }

  // Find trip by ID
  static async findById(id) {
    const trip = await db('trips')
      .select('*')
      .where('id', id)
      .first();

    if (trip) {
      // Parse JSON fields
      trip.route_data = JSON.parse(trip.route_data || '{}');
      trip.air_quality_data = JSON.parse(trip.air_quality_data || '[]');
      trip.breathability_score = JSON.parse(trip.breathability_score || '{}');
      trip.health_actions = JSON.parse(trip.health_actions || '[]');
    }

    return trip;
  }

  // Find trips by user ID
  static async findByUserId(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      status = null,
      startDate = null,
      endDate = null,
      routeType = null
    } = options;

    let query = db('trips')
      .select([
        'id',
        'origin_address',
        'destination_address',
        'route_type',
        'distance_meters',
        'duration_seconds',
        'average_aqi',
        'breathability_score',
        'status',
        'created_at',
        'updated_at',
        'started_at',
        'completed_at'
      ])
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', status);
    }

    if (routeType) {
      query = query.where('route_type', routeType);
    }

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const trips = await query;

    // Parse JSON fields
    return trips.map(trip => ({
      ...trip,
      breathability_score: JSON.parse(trip.breathability_score || '{}')
    }));
  }

  // Update trip
  static async update(id, updates) {
    const updateData = {
      updated_at: db.fn.now()
    };

    // Handle status updates
    if (updates.status) {
      updateData.status = updates.status;
      
      if (updates.status === 'in_progress') {
        updateData.started_at = db.fn.now();
      } else if (updates.status === 'completed') {
        updateData.completed_at = db.fn.now();
      }
    }

    // Handle actual trip data
    if (updates.actualDuration !== undefined) {
      updateData.actual_duration_seconds = updates.actualDuration;
    }

    if (updates.actualDistance !== undefined) {
      updateData.actual_distance_meters = updates.actualDistance;
    }

    // Handle health actions
    if (updates.healthActions) {
      updateData.health_actions = JSON.stringify(updates.healthActions);
    }

    if (updates.notes) {
      updateData.notes = updates.notes;
    }

    // Handle air quality updates during trip
    if (updates.airQualityData) {
      updateData.air_quality_data = JSON.stringify(updates.airQualityData);
      
      // Recalculate breathability score
      const newBreathabilityScore = calculateBreathabilityScore(updates.airQualityData);
      updateData.breathability_score = JSON.stringify(newBreathabilityScore);
      updateData.average_aqi = newBreathabilityScore.avgAQI;
      updateData.max_aqi = newBreathabilityScore.maxAQI;
      updateData.min_aqi = newBreathabilityScore.minAQI;
    }

    const [trip] = await db('trips')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (trip) {
      // Parse JSON fields
      trip.route_data = JSON.parse(trip.route_data || '{}');
      trip.air_quality_data = JSON.parse(trip.air_quality_data || '[]');
      trip.breathability_score = JSON.parse(trip.breathability_score || '{}');
      trip.health_actions = JSON.parse(trip.health_actions || '[]');
    }

    return trip;
  }

  // Delete trip
  static async delete(id) {
    const deletedCount = await db('trips')
      .where('id', id)
      .del();

    return deletedCount > 0;
  }

  // Get trip statistics for user
  static async getUserTripStats(userId, period = 'week') {
    let dateFilter;
    
    switch (period) {
      case 'day':
        dateFilter = "NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "NOW() - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "NOW() - INTERVAL '365 days'";
        break;
      default:
        dateFilter = "NOW() - INTERVAL '7 days'";
    }

    const stats = await db('trips')
      .select(
        db.raw('COUNT(*) as total_trips'),
        db.raw('SUM(distance_meters) as total_distance'),
        db.raw('SUM(duration_seconds) as total_time'),
        db.raw('AVG(average_aqi) as avg_aqi'),
        db.raw('COUNT(*) FILTER (WHERE route_type = \'healthiest\') as healthy_routes'),
        db.raw('COUNT(*) FILTER (WHERE status = \'completed\') as completed_trips')
      )
      .where('user_id', userId)
      .where('created_at', '>=', db.raw(dateFilter))
      .first();

    return {
      totalTrips: parseInt(stats.total_trips) || 0,
      totalDistance: parseFloat(stats.total_distance) || 0,
      totalTime: parseInt(stats.total_time) || 0,
      avgAQI: parseFloat(stats.avg_aqi) || 0,
      healthyRoutePercentage: stats.total_trips > 0 
        ? Math.round((stats.healthy_routes / stats.total_trips) * 100) 
        : 0,
      completedTrips: parseInt(stats.completed_trips) || 0
    };
  }

  // Get exposure analysis
  static async getExposureAnalysis(userId, period = 'week') {
    let dateFilter;
    
    switch (period) {
      case 'week':
        dateFilter = "NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "NOW() - INTERVAL '30 days'";
        break;
      default:
        dateFilter = "NOW() - INTERVAL '7 days'";
    }

    const trips = await db('trips')
      .select(['air_quality_data', 'duration_seconds'])
      .where('user_id', userId)
      .where('created_at', '>=', db.raw(dateFilter))
      .where('status', 'completed');

    let totalExposureTime = {
      good: 0,      // AQI 0-50
      moderate: 0,  // AQI 51-100
      unhealthy: 0, // AQI 101-150
      veryUnhealthy: 0 // AQI 151+
    };

    trips.forEach(trip => {
      const aqiData = JSON.parse(trip.air_quality_data || '[]');
      const segmentTime = Math.floor(trip.duration_seconds / Math.max(aqiData.length, 1));

      aqiData.forEach(point => {
        if (point.aqi <= 50) {
          totalExposureTime.good += segmentTime;
        } else if (point.aqi <= 100) {
          totalExposureTime.moderate += segmentTime;
        } else if (point.aqi <= 150) {
          totalExposureTime.unhealthy += segmentTime;
        } else {
          totalExposureTime.veryUnhealthy += segmentTime;
        }
      });
    });

    // Convert to minutes
    Object.keys(totalExposureTime).forEach(key => {
      totalExposureTime[key] = Math.floor(totalExposureTime[key] / 60);
    });

    return totalExposureTime;
  }
}

module.exports = Trip;
