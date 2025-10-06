const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateTripId } = require('../utils/helpers');

class User {
  // Create new user
  static async create(userData) {
    const { name, email, password } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [user] = await db('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: hashedPassword,
        health_profile: JSON.stringify({
          age: null,
          hasRespiratoryConditions: false,
          hasHeartConditions: false,
          hasAllergies: false,
          isPregnant: false,
          sensitivityLevel: 'normal',
          activityLevel: 'moderate'
        }),
        preferences: JSON.stringify({
          preferredCommute: 'balanced',
          workSchedule: 'flexible',
          notifications: {
            proactiveAlerts: true,
            timeIntelligence: true,
            routeAlerts: true,
            healthRecommendations: true,
            dailySummary: true
          },
          alertThresholds: {
            moderateAQI: 51,
            unhealthyAQI: 101,
            veryUnhealthyAQI: 151,
            customThreshold: false
          }
        }),
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning(['id', 'name', 'email', 'created_at']);
    
    return user;
  }

  // Find user by email
  static async findByEmail(email) {
    const user = await db('users')
      .select('*')
      .where('email', email.toLowerCase().trim())
      .first();
    
    if (user) {
      // Parse JSON fields
      user.health_profile = JSON.parse(user.health_profile || '{}');
      user.preferences = JSON.parse(user.preferences || '{}');
    }
    
    return user;
  }

  // Find user by ID
  static async findById(id) {
    const user = await db('users')
      .select(['id', 'name', 'email', 'health_profile', 'preferences', 'created_at', 'updated_at'])
      .where('id', id)
      .first();
    
    if (user) {
      // Parse JSON fields
      user.health_profile = JSON.parse(user.health_profile || '{}');
      user.preferences = JSON.parse(user.preferences || '{}');
    }
    
    return user;
  }

  // Update user profile
  static async updateProfile(id, updates) {
    const updateData = {
      updated_at: db.fn.now()
    };

    // Handle name update
    if (updates.name) {
      updateData.name = updates.name.trim();
    }

    // Handle health profile update
    if (updates.healthProfile) {
      const currentUser = await this.findById(id);
      const currentHealthProfile = currentUser.health_profile || {};
      const updatedHealthProfile = { ...currentHealthProfile, ...updates.healthProfile };
      updateData.health_profile = JSON.stringify(updatedHealthProfile);
    }

    // Handle preferences update
    if (updates.preferences) {
      const currentUser = await this.findById(id);
      const currentPreferences = currentUser.preferences || {};
      const updatedPreferences = { ...currentPreferences, ...updates.preferences };
      updateData.preferences = JSON.stringify(updatedPreferences);
    }

    const [user] = await db('users')
      .where('id', id)
      .update(updateData)
      .returning(['id', 'name', 'email', 'health_profile', 'preferences', 'updated_at']);
    
    if (user) {
      user.health_profile = JSON.parse(user.health_profile || '{}');
      user.preferences = JSON.parse(user.preferences || '{}');
    }
    
    return user;
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await db('users')
      .where('id', id)
      .update({
        password_hash: hashedPassword,
        updated_at: db.fn.now()
      });
    
    return true;
  }

  // Get user statistics
  static async getStats(id) {
    const stats = await db('trips')
      .select(
        db.raw('COUNT(*) as total_trips'),
        db.raw('SUM(distance_meters) as total_distance'),
        db.raw('SUM(duration_seconds) as total_time'),
        db.raw('AVG(average_aqi) as avg_exposure'),
        db.raw('COUNT(*) FILTER (WHERE route_type = \'healthiest\') as healthy_route_count'),
        db.raw('COUNT(*) FILTER (WHERE status = \'completed\') as completed_trips')
      )
      .where('user_id', id)
      .first();
    
    // Get weekly trend
    const weeklyStats = await db('trips')
      .select(
        db.raw('COUNT(*) as this_week_trips'),
        db.raw('AVG(average_aqi) as this_week_avg_aqi')
      )
      .where('user_id', id)
      .where('created_at', '>=', db.raw("NOW() - INTERVAL '7 days'"))
      .first();

    return {
      totalTrips: parseInt(stats.total_trips) || 0,
      totalDistance: parseFloat(stats.total_distance) || 0,
      totalTime: parseInt(stats.total_time) || 0,
      avgExposure: parseFloat(stats.avg_exposure) || 0,
      healthyRoutePercentage: stats.total_trips > 0 
        ? Math.round((stats.healthy_route_count / stats.total_trips) * 100) 
        : 0,
      completedTrips: parseInt(stats.completed_trips) || 0,
      thisWeekTrips: parseInt(weeklyStats.this_week_trips) || 0,
      thisWeekAvgAQI: parseFloat(weeklyStats.this_week_avg_aqi) || 0
    };
  }

  // Get user's recent activity
  static async getRecentActivity(id, limit = 10) {
    const activities = await db('trips')
      .select([
        'id',
        'origin_address',
        'destination_address',
        'route_type',
        'average_aqi',
        'breathability_score',
        'status',
        'created_at'
      ])
      .where('user_id', id)
      .orderBy('created_at', 'desc')
      .limit(limit);

    return activities.map(activity => ({
      ...activity,
      breathability_score: JSON.parse(activity.breathability_score || '{}')
    }));
  }

  // Delete user and all related data
  static async delete(id) {
    const trx = await db.transaction();
    
    try {
      // Delete user's trips
      await trx('trips').where('user_id', id).del();
      
      // Delete user
      await trx('users').where('id', id).del();
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = User;
