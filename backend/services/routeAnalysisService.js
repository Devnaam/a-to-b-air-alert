const airQualityService = require('./airQualityService');
const mapsService = require('./mapsService');
const { calculateBreathabilityScore, getAQILevel, calculateHealthScore } = require('../utils/helpers');
const logger = require('../utils/logger');

class RouteAnalysisService {
  // Analyze route with air quality data
  async analyzeRoute(route, userProfile = {}) {
    try {
      // Extract coordinates along the route
      const coordinates = mapsService.getRouteCoordinates(route, 8);
      
      if (coordinates.length === 0) {
        throw new Error('Unable to extract route coordinates');
      }

      // Get air quality data for route points
      const airQualityData = await airQualityService.getRouteAirQuality(coordinates);
      
      // Calculate breathability score
      const breathabilityScore = calculateBreathabilityScore(airQualityData.map(d => ({ aqi: d.aqi })));
      
      // Calculate health impact
      const healthImpact = this.calculateHealthImpact(airQualityData, userProfile);
      
      // Generate proactive alerts
      const alerts = this.generateProactiveAlerts(airQualityData, userProfile);
      
      // Get time-based recommendations
      const timeRecommendations = await this.getTimeRecommendations(route, airQualityData);

      return {
        routeId: route.routeId || mapsService.generateRouteHash(
          { lat: route.legs[0].start_location.lat, lng: route.legs[0].start_location.lng },
          { lat: route.legs[0].end_location.lat, lng: route.legs[0].end_location.lng },
          route
        ),
        airQualityData,
        breathabilityScore,
        healthImpact,
        alerts,
        timeRecommendations,
        analysisTimestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Route analysis error:', error);
      throw error;
    }
  }

  // Calculate health impact based on user profile
  calculateHealthImpact(airQualityData, userProfile) {
    const avgAQI = airQualityData.reduce((sum, d) => sum + d.aqi, 0) / airQualityData.length;
    const maxAQI = Math.max(...airQualityData.map(d => d.aqi));
    const minAQI = Math.min(...airQualityData.map(d => d.aqi));
    
    // Calculate exposure risk multiplier based on user profile
    let riskMultiplier = 1;
    if (userProfile.hasRespiratoryConditions) riskMultiplier += 0.5;
    if (userProfile.hasHeartConditions) riskMultiplier += 0.4;
    if (userProfile.isPregnant) riskMultiplier += 0.3;
    if (userProfile.age > 65 || userProfile.age < 12) riskMultiplier += 0.2;
    if (userProfile.sensitivityLevel === 'very-sensitive') riskMultiplier += 0.3;
    else if (userProfile.sensitivityLevel === 'sensitive') riskMultiplier += 0.2;

    const adjustedAQI = avgAQI * riskMultiplier;
    const healthScore = calculateHealthScore(adjustedAQI, userProfile);
    
    // Determine risk level and recommendations
    let riskLevel, recommendations;
    
    if (adjustedAQI <= 50) {
      riskLevel = 'low';
      recommendations = [
        'Excellent conditions for travel',
        'No special precautions needed',
        'Great time for outdoor activities'
      ];
    } else if (adjustedAQI <= 100) {
      riskLevel = 'low';
      recommendations = [
        'Good conditions for most people',
        'Stay hydrated during travel',
        'Monitor air quality if you\'re sensitive'
      ];
    } else if (adjustedAQI <= 150) {
      riskLevel = 'moderate';
      recommendations = [
        'Consider closing car windows in high AQI areas',
        'Use A/C recirculation mode',
        'Limit outdoor stops if possible'
      ];
    } else if (adjustedAQI <= 200) {
      riskLevel = 'high';
      recommendations = [
        'Wear N95 mask if traveling by two-wheeler',
        'Keep windows closed and use A/C recirculation',
        'Consider postponing travel if possible',
        'Use air purifier for 2+ hours post-trip'
      ];
    } else {
      riskLevel = 'very-high';
      recommendations = [
        'Strongly consider postponing non-essential travel',
        'If travel is necessary, wear N95 mask',
        'Keep all windows closed',
        'Use air purifier for 3+ hours post-trip',
        'Monitor for respiratory symptoms'
      ];
    }

    return {
      avgAQI: Math.floor(avgAQI),
      adjustedAQI: Math.floor(adjustedAQI),
      maxAQI: Math.floor(maxAQI),
      minAQI: Math.floor(minAQI),
      healthScore,
      riskLevel,
      riskMultiplier: Math.round(riskMultiplier * 100) / 100,
      recommendations,
      estimatedPM25Exposure: Math.floor(avgAQI * 0.6), // Rough PM2.5 estimate
      recoveryTime: this.calculateRecoveryTime(adjustedAQI)
    };
  }

  // Calculate recommended recovery time after exposure
  calculateRecoveryTime(aqi) {
    if (aqi <= 50) return '0 hours';
    if (aqi <= 100) return '30 minutes';
    if (aqi <= 150) return '1-2 hours';
    if (aqi <= 200) return '2-3 hours';
    if (aqi <= 300) return '3-4 hours';
    return '4+ hours';
  }

  // Generate proactive alerts for the route
  generateProactiveAlerts(airQualityData, userProfile) {
    const alerts = [];
    
    for (let i = 0; i < airQualityData.length; i++) {
      const point = airQualityData[i];
      const aqiLevel = getAQILevel(point.aqi);
      
      // Generate alerts based on AQI levels and user profile
      if (point.aqi > 150) {
        const distance = i === 0 ? '0 km' : `${(i * 2).toFixed(1)} km`; // Approximate distance
        
        alerts.push({
          id: `alert_${i}_${Date.now()}`,
          type: 'high-pollution',
          severity: point.aqi > 200 ? 'high' : 'moderate',
          distance,
          aqi: point.aqi,
          aqiLevel: aqiLevel.level,
          message: `High pollution zone ahead (AQI ${point.aqi}). ${this.getAlertRecommendation(point.aqi, userProfile)}`,
          action: this.getAlertAction(point.aqi),
          location: point.location
        });
      } else if (point.aqi > 100 && (userProfile.hasRespiratoryConditions || userProfile.sensitivityLevel === 'sensitive')) {
        const distance = i === 0 ? '0 km' : `${(i * 2).toFixed(1)} km`;
        
        alerts.push({
          id: `alert_sensitive_${i}_${Date.now()}`,
          type: 'sensitive-advisory',
          severity: 'low',
          distance,
          aqi: point.aqi,
          aqiLevel: aqiLevel.level,
          message: `Moderate pollution ahead (AQI ${point.aqi}). Consider precautions due to your health profile.`,
          action: 'Monitor Symptoms',
          location: point.location
        });
      }
    }

    // Add improvement alerts
    const improvementPoints = this.findAirQualityImprovements(airQualityData);
    improvementPoints.forEach((point, index) => {
      alerts.push({
        id: `improvement_${index}_${Date.now()}`,
        type: 'improvement',
        severity: 'info',
        distance: `${(point.segmentIndex * 2).toFixed(1)} km`,
        aqi: point.aqi,
        aqiLevel: getAQILevel(point.aqi).level,
        message: `Air quality improving ahead! Good area for a break if needed.`,
        action: 'Plan Break',
        location: point.location
      });
    });

    return alerts;
  }

  // Get alert recommendation based on AQI and user profile
  getAlertRecommendation(aqi, userProfile) {
    if (aqi > 200) {
      return 'Close windows immediately and use A/C recirculation.';
    } else if (aqi > 150) {
      if (userProfile.hasRespiratoryConditions) {
        return 'Close windows and consider wearing a mask.';
      }
      return 'Close windows and use A/C recirculation.';
    }
    return 'Monitor air quality and consider precautions.';
  }

  // Get suggested action for alert
  getAlertAction(aqi) {
    if (aqi > 200) return 'Close Windows';
    if (aqi > 150) return 'Use Recirculation';
    return 'Monitor';
  }

  // Find points where air quality improves significantly
  findAirQualityImprovements(airQualityData) {
    const improvements = [];
    
    for (let i = 1; i < airQualityData.length; i++) {
      const current = airQualityData[i];
      const previous = airQualityData[i - 1];
      
      // Significant improvement (reduction of 50+ AQI points)
      if (previous.aqi - current.aqi >= 50) {
        improvements.push({
          segmentIndex: i,
          aqi: current.aqi,
          improvement: previous.aqi - current.aqi,
          location: current.location
        });
      }
    }
    
    return improvements;
  }

  // Get time-based recommendations
  async getTimeRecommendations(route, airQualityData) {
    try {
      const currentHour = new Date().getHours();
      const recommendations = [];
      
      // Generate hourly predictions for next 24 hours
      const hourlyPredictions = [];
      for (let hour = 0; hour < 24; hour++) {
        const multiplier = this.getTimeBasedMultiplier(hour);
        const avgAQI = airQualityData.reduce((sum, d) => sum + d.aqi, 0) / airQualityData.length;
        const predictedAQI = Math.floor(avgAQI * multiplier);
        
        hourlyPredictions.push({
          hour,
          aqi: predictedAQI,
          recommendation: this.getTimeRecommendation(predictedAQI),
          isOptimal: predictedAQI < avgAQI * 0.8 // 20% better than average
        });
      }

      // Find best travel times
      const optimalTimes = hourlyPredictions
        .filter(p => p.isOptimal)
        .sort((a, b) => a.aqi - b.aqi)
        .slice(0, 3);

      if (optimalTimes.length > 0) {
        recommendations.push({
          type: 'optimal-timing',
          message: `Better air quality expected at ${optimalTimes[0].hour}:00 (AQI ${optimalTimes[0].aqi})`,
          optimalTimes: optimalTimes.map(t => ({
            time: `${t.hour}:00`,
            aqi: t.aqi,
            improvement: Math.floor(((airQualityData.reduce((sum, d) => sum + d.aqi, 0) / airQualityData.length) - t.aqi))
          }))
        });
      }

      return {
        currentConditions: {
          hour: currentHour,
          recommendation: this.getTimeRecommendation(airQualityData.reduce((sum, d) => sum + d.aqi, 0) / airQualityData.length)
        },
        hourlyPredictions,
        recommendations
      };
    } catch (error) {
      logger.error('Time recommendations error:', error);
      return {
        currentConditions: { hour: new Date().getHours(), recommendation: 'Monitor conditions' },
        hourlyPredictions: [],
        recommendations: []
      };
    }
  }

  // Get time-based AQI multiplier (traffic and pollution patterns)
  getTimeBasedMultiplier(hour) {
    if (hour >= 7 && hour <= 10) return 1.3; // Morning rush
    if (hour >= 17 && hour <= 20) return 1.4; // Evening rush
    if (hour >= 22 || hour <= 5) return 0.7; // Night hours
    if (hour >= 11 && hour <= 16) return 1.1; // Afternoon
    return 1.0; // Default
  }

  // Get time-based recommendation
  getTimeRecommendation(aqi) {
    if (aqi < 50) return 'Excellent time to travel';
    if (aqi < 100) return 'Good conditions for travel';
    if (aqi < 150) return 'Acceptable conditions with precautions';
    if (aqi < 200) return 'Consider postponing if possible';
    return 'Avoid travel if not essential';
  }

  // Compare multiple routes
  async compareRoutes(routes, userProfile = {}) {
    try {
      const comparisons = await Promise.all(
        routes.map(route => this.analyzeRoute(route, userProfile))
      );

      // Rank routes based on health score and user preferences
      const rankedRoutes = comparisons
        .map((analysis, index) => ({
          ...analysis,
          route: routes[index],
          overallScore: this.calculateOverallScore(analysis, userProfile)
        }))
        .sort((a, b) => b.overallScore - a.overallScore);

      return {
        routes: rankedRoutes,
        recommendation: this.generateRouteRecommendation(rankedRoutes, userProfile),
        comparisonTimestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Route comparison error:', error);
      throw error;
    }
  }

  // Calculate overall route score
  calculateOverallScore(analysis, userProfile) {
    const { breathabilityScore, healthImpact } = analysis;
    const route = analysis.route;
    
    let score = breathabilityScore.score; // Base score from breathability
    
    // Adjust based on user preferences
    if (userProfile.preferredCommute === 'healthiest') {
      // Prioritize health score
      score = score * 0.8 + healthImpact.healthScore * 0.2;
    } else if (userProfile.preferredCommute === 'fastest') {
      // Factor in time efficiency
      const timeFactor = Math.max(0.5, 1 - (route.legs[0].duration.value / 3600) * 0.1);
      score = score * 0.6 + (timeFactor * 100) * 0.4;
    }
    // 'balanced' uses base score as-is
    
    return Math.min(100, Math.max(0, score));
  }

  // Generate route recommendation
  generateRouteRecommendation(rankedRoutes, userProfile) {
    if (rankedRoutes.length === 0) {
      return { message: 'No routes available for comparison', type: 'error' };
    }

    const best = rankedRoutes[0];
    const worst = rankedRoutes[rankedRoutes.length - 1];
    
    if (rankedRoutes.length === 1) {
      return {
        message: `Route has ${best.breathabilityScore.grade} air quality rating`,
        type: 'single',
        score: best.overallScore
      };
    }

    const scoreDifference = best.overallScore - worst.overallScore;
    
    if (scoreDifference > 20) {
      return {
        message: `Healthiest route is significantly better (${scoreDifference.toFixed(0)} points higher)`,
        type: 'strong-preference',
        recommendedRoute: 0,
        benefit: `${Math.floor(worst.healthImpact.avgAQI - best.healthImpact.avgAQI)} AQI points less exposure`
      };
    } else if (scoreDifference > 10) {
      return {
        message: `Healthiest route offers moderate improvement`,
        type: 'moderate-preference',
        recommendedRoute: 0,
        benefit: `${Math.floor(worst.healthImpact.avgAQI - best.healthImpact.avgAQI)} AQI points less exposure`
      };
    } else {
      return {
        message: `Routes have similar air quality impact`,
        type: 'similar',
        note: 'Choose based on time preference'
      };
    }
  }
}

module.exports = new RouteAnalysisService();
