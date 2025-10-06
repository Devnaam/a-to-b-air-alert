/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clean existing data
  await knex('trips').del();
  await knex('routes').del();
  await knex('users').del();

  // Reset sequences if PostgreSQL
  if (knex.client.config.client === 'postgresql') {
    await knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await knex.raw('ALTER SEQUENCE routes_id_seq RESTART WITH 1');
  }

  // Insert sample users
  const users = await knex('users').insert([
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6jEuWOgR.q', // password123
      health_profile: JSON.stringify({
        age: 32,
        hasRespiratoryConditions: false,
        hasHeartConditions: false,
        hasAllergies: true,
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
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6jEuWOgR.q', // password123
      health_profile: JSON.stringify({
        age: 28,
        hasRespiratoryConditions: true,
        hasHeartConditions: false,
        hasAllergies: false,
        isPregnant: false,
        sensitivityLevel: 'sensitive',
        activityLevel: 'high'
      }),
      preferences: JSON.stringify({
        preferredCommute: 'healthiest',
        workSchedule: 'fixed',
        notifications: {
          proactiveAlerts: true,
          timeIntelligence: true,
          routeAlerts: true,
          healthRecommendations: true,
          dailySummary: true
        },
        alertThresholds: {
          moderateAQI: 40,
          unhealthyAQI: 80,
          veryUnhealthyAQI: 120,
          customThreshold: true
        }
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]).returning('id');

  const userId1 = users[0].id || users[0];
  const userId2 = users[1].id || users[1];

  // Insert sample routes
  await knex('routes').insert([
    {
      origin_lat: 28.6139,
      origin_lng: 77.2090,
      destination_lat: 28.5355,
      destination_lng: 77.3910,
      route_hash: 'delhi_to_noida_main',
      distance_meters: 25000,
      duration_seconds: 2100,
      air_quality_data: JSON.stringify([
        { location: { lat: 28.6139, lng: 77.2090 }, aqi: 145, timestamp: '2023-10-06T09:00:00Z' },
        { location: { lat: 28.5900, lng: 77.2500 }, aqi: 165, timestamp: '2023-10-06T09:15:00Z' },
        { location: { lat: 28.5600, lng: 77.3200 }, aqi: 125, timestamp: '2023-10-06T09:25:00Z' },
        { location: { lat: 28.5355, lng: 77.3910 }, aqi: 95, timestamp: '2023-10-06T09:35:00Z' }
      ]),
      breathability_score: JSON.stringify({
        score: 72,
        grade: 'B',
        avgAQI: 132,
        maxAQI: 165,
        minAQI: 95,
        analysis: 'Moderate air quality, consider precautions for sensitive individuals'
      }),
      usage_count: 15,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      origin_lat: 28.5355,
      origin_lng: 77.3910,
      destination_lat: 28.6139,
      destination_lng: 77.2090,
      route_hash: 'noida_to_delhi_main',
      distance_meters: 24500,
      duration_seconds: 1980,
      air_quality_data: JSON.stringify([
        { location: { lat: 28.5355, lng: 77.3910 }, aqi: 88, timestamp: '2023-10-06T18:00:00Z' },
        { location: { lat: 28.5600, lng: 77.3200 }, aqi: 142, timestamp: '2023-10-06T18:12:00Z' },
        { location: { lat: 28.5900, lng: 77.2500 }, aqi: 178, timestamp: '2023-10-06T18:22:00Z' },
        { location: { lat: 28.6139, lng: 77.2090 }, aqi: 156, timestamp: '2023-10-06T18:33:00Z' }
      ]),
      breathability_score: JSON.stringify({
        score: 65,
        grade: 'C',
        avgAQI: 141,
        maxAQI: 178,
        minAQI: 88,
        analysis: 'Unhealthy air quality, take protective measures'
      }),
      usage_count: 12,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Insert sample trips
  await knex('trips').insert([
    {
      id: 'trip_sample_001',
      user_id: userId1,
      origin_lat: 28.6139,
      origin_lng: 77.2090,
      origin_address: 'Connaught Place, New Delhi',
      destination_lat: 28.5355,
      destination_lng: 77.3910,
      destination_address: 'Sector 62, Noida',
      route_data: JSON.stringify({
        legs: [{
          distance: { text: '25.0 km', value: 25000 },
          duration: { text: '35 min', value: 2100 },
          start_location: { lat: 28.6139, lng: 77.2090 },
          end_location: { lat: 28.5355, lng: 77.3910 }
        }],
        summary: 'NH 24 via Akshardham'
      }),
      air_quality_data: JSON.stringify([
        { location: { lat: 28.6139, lng: 77.2090 }, aqi: 145 },
        { location: { lat: 28.5900, lng: 77.2500 }, aqi: 165 },
        { location: { lat: 28.5600, lng: 77.3200 }, aqi: 125 },
        { location: { lat: 28.5355, lng: 77.3910 }, aqi: 95 }
      ]),
      breathability_score: JSON.stringify({
        score: 72,
        grade: 'B',
        avgAQI: 132
      }),
      route_type: 'fastest',
      distance_meters: 25000,
      duration_seconds: 2100,
      actual_distance_meters: 25200,
      actual_duration_seconds: 2250,
      average_aqi: 132,
      max_aqi: 165,
      min_aqi: 95,
      status: 'completed',
      health_actions: JSON.stringify(['Closed windows in high AQI zone', 'Used A/C recirculation']),
      notes: 'Heavy traffic on NH 24, but air quality was manageable',
      created_at: knex.raw("NOW() - INTERVAL '2 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'"),
      started_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '1 hour'"),
      completed_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '1 hour 35 minutes'")
    },
    {
      id: 'trip_sample_002',
      user_id: userId2,
      origin_lat: 28.5355,
      origin_lng: 77.3910,
      origin_address: 'Sector 62, Noida',
      destination_lat: 28.6139,
      destination_lng: 77.2090,
      destination_address: 'Connaught Place, New Delhi',
      route_data: JSON.stringify({
        legs: [{
          distance: { text: '26.2 km', value: 26200 },
          duration: { text: '42 min', value: 2520 },
          start_location: { lat: 28.5355, lng: 77.3910 },
          end_location: { lat: 28.6139, lng: 77.2090 }
        }],
        summary: 'DND Flyway - Healthiest Route'
      }),
      air_quality_data: JSON.stringify([
        { location: { lat: 28.5355, lng: 77.3910 }, aqi: 78 },
        { location: { lat: 28.5500, lng: 77.3200 }, aqi: 92 },
        { location: { lat: 28.5800, lng: 77.2800 }, aqi: 115 },
        { location: { lat: 28.6139, lng: 77.2090 }, aqi: 135 }
      ]),
      breathability_score: JSON.stringify({
        score: 85,
        grade: 'A',
        avgAQI: 105
      }),
      route_type: 'healthiest',
      distance_meters: 26200,
      duration_seconds: 2520,
      average_aqi: 105,
      max_aqi: 135,
      min_aqi: 78,
      status: 'completed',
      health_actions: JSON.stringify(['Chose healthier route', 'Took short break in clean zone']),
      notes: 'Longer route but much better air quality',
      created_at: knex.raw("NOW() - INTERVAL '1 day'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'"),
      started_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'"),
      completed_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '1 hour 12 minutes'")
    },
    {
      id: 'trip_sample_003',
      user_id: userId1,
      origin_lat: 28.6139,
      origin_lng: 77.2090,
      origin_address: 'Connaught Place, New Delhi',
      destination_lat: 28.4595,
      destination_lng: 77.0266,
      destination_address: 'Cyber City, Gurugram',
      route_data: JSON.stringify({
        legs: [{
          distance: { text: '28.5 km', value: 28500 },
          duration: { text: '45 min', value: 2700 },
          start_location: { lat: 28.6139, lng: 77.2090 },
          end_location: { lat: 28.4595, lng: 77.0266 }
        }],
        summary: 'NH 48 via Dhaula Kuan'
      }),
      air_quality_data: JSON.stringify([
        { location: { lat: 28.6139, lng: 77.2090 }, aqi: 155 },
        { location: { lat: 28.5800, lng: 77.1500 }, aqi: 175 },
        { location: { lat: 28.5200, lng: 77.1000 }, aqi: 145 },
        { location: { lat: 28.4595, lng: 77.0266 }, aqi: 125 }
      ]),
      breathability_score: JSON.stringify({
        score: 58,
        grade: 'C',
        avgAQI: 150
      }),
      route_type: 'fastest',
      distance_meters: 28500,
      duration_seconds: 2700,
      average_aqi: 150,
      max_aqi: 175,
      min_aqi: 125,
      status: 'planned',
      health_actions: JSON.stringify([]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
