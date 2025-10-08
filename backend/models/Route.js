const db = require('../config/database');

class Route {
  // Create a new route (for caching popular routes)
  static async create(routeData) {
    const {
      origin,
      destination,
      routeHash,
      distance,
      duration,
      airQualityData,
      breathabilityScore
    } = routeData;

    const [route] = await db('routes')
      .insert({
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        route_hash: routeHash,
        distance_meters: distance,
        duration_seconds: duration,
        air_quality_data: JSON.stringify(airQualityData || []),
        breathability_score: JSON.stringify(breathabilityScore || {}),
        usage_count: 1,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    // Parse JSON fields
    route.air_quality_data = JSON.parse(route.air_quality_data || '[]');
    route.breathability_score = JSON.parse(route.breathability_score || '{}');

    return route;
  }

  // Find route by hash
  static async findByHash(routeHash) {
    const route = await db('routes')
      .select('*')
      .where('route_hash', routeHash)
      .first();

    if (route) {
      // Parse JSON fields
      route.air_quality_data = JSON.parse(route.air_quality_data || '[]');
      route.breathability_score = JSON.parse(route.breathability_score || '{}');
    }

    return route;
  }

  // Find similar routes (within a certain distance threshold)
  static async findSimilar(origin, destination, thresholdKm = 1) {
    const routes = await db('routes')
      .select('*')
      .whereRaw(`
        ST_DWithin(
          ST_MakePoint(origin_lng, origin_lat)::geography,
          ST_MakePoint(?, ?)::geography,
          ? * 1000
        ) AND ST_DWithin(
          ST_MakePoint(destination_lng, destination_lat)::geography,
          ST_MakePoint(?, ?)::geography,
          ? * 1000
        )
      `, [origin.lng, origin.lat, thresholdKm, destination.lng, destination.lat, thresholdKm])
      .orderBy('usage_count', 'desc')
      .limit(10);

    return routes.map(route => ({
      ...route,
      air_quality_data: JSON.parse(route.air_quality_data || '[]'),
      breathability_score: JSON.parse(route.breathability_score || '{}')
    }));
  }

  // Update route usage count and air quality data
  static async updateUsage(id, newAirQualityData = null) {
    const updateData = {
      usage_count: db.raw('usage_count + 1'),
      updated_at: db.fn.now()
    };

    // Update air quality data if provided (fresher data)
    if (newAirQualityData) {
      updateData.air_quality_data = JSON.stringify(newAirQualityData);
      
      // Recalculate breathability score
      const { calculateBreathabilityScore } = require('../utils/helpers');
      const newScore = calculateBreathabilityScore(newAirQualityData);
      updateData.breathability_score = JSON.stringify(newScore);
    }

    const [route] = await db('routes')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (route) {
      route.air_quality_data = JSON.parse(route.air_quality_data || '[]');
      route.breathability_score = JSON.parse(route.breathability_score || '{}');
    }

    return route;
  }

  // Get popular routes
  static async getPopular(limit = 10) {
  const routes = await db('routes')
    .select([
      'id',
      'origin_lat',
      'origin_lng', 
      'destination_lat',
      'destination_lng',
      'distance_meters',
      'duration_seconds',
      'breathability_score',
      'usage_count',
      'updated_at'
    ])
    .orderBy('usage_count', 'desc')
    .limit(limit);

  return routes.map(route => {
    // Safely parse JSON fields
    let breathability_score = {};
    try {
      breathability_score = typeof route.breathability_score === 'string' 
        ? JSON.parse(route.breathability_score) 
        : route.breathability_score || {};
    } catch (error) {
      console.warn('JSON parse error for breathability_score:', error);
      breathability_score = {};
    }

    return {
      ...route,
      breathability_score
    };
  });
}

  // Clean old routes (remove unused routes older than 30 days)
  static async cleanOldRoutes() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const deletedCount = await db('routes')
      .where('usage_count', '=', 1)
      .where('updated_at', '<', cutoffDate)
      .del();

    return deletedCount;
  }

  // Get route statistics
  static async getStats() {
    const stats = await db('routes')
      .select(
        db.raw('COUNT(*) as total_routes'),
        db.raw('SUM(usage_count) as total_usage'),
        db.raw('AVG(distance_meters) as avg_distance'),
        db.raw('AVG(duration_seconds) as avg_duration')
      )
      .first();

    return {
      totalRoutes: parseInt(stats.total_routes) || 0,
      totalUsage: parseInt(stats.total_usage) || 0,
      avgDistance: parseFloat(stats.avg_distance) || 0,
      avgDuration: parseInt(stats.avg_duration) || 0
    };
  }
}

module.exports = Route;
