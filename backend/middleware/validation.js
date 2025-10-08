const Joi = require('joi');
const AppError = require('../utils/AppError');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(message, 400));
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  registerUser: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required()
  }),

  // this is geoecnogoind schema
  geocodeAddress: Joi.object({
    address: Joi.string().min(3).max(200).required()
  }),

  // User login
  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Update user profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    healthProfile: Joi.object({
      age: Joi.number().min(1).max(120),
      hasRespiratoryConditions: Joi.boolean(),
      hasHeartConditions: Joi.boolean(),
      hasAllergies: Joi.boolean(),
      isPregnant: Joi.boolean(),
      sensitivityLevel: Joi.string().valid('normal', 'sensitive', 'very-sensitive'),
      activityLevel: Joi.string().valid('low', 'moderate', 'high')
    }),
    preferences: Joi.object({
      preferredCommute: Joi.string().valid('fastest', 'healthiest', 'balanced'),
      workSchedule: Joi.string().valid('fixed', 'flexible', 'remote', 'shift'),
      notifications: Joi.object({
        proactiveAlerts: Joi.boolean(),
        timeIntelligence: Joi.boolean(),
        routeAlerts: Joi.boolean(),
        healthRecommendations: Joi.boolean(),
        dailySummary: Joi.boolean()
      }),
      alertThresholds: Joi.object({
        moderateAQI: Joi.number().min(1).max(500),
        unhealthyAQI: Joi.number().min(1).max(500),
        veryUnhealthyAQI: Joi.number().min(1).max(500),
        customThreshold: Joi.boolean()
      })
    })
  }),

  // Route planning
  planRoute: Joi.object({
    origin: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
      address: Joi.string().required()
    }).required(),
    destination: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
      address: Joi.string().required()
    }).required(),
    alternatives: Joi.boolean().default(true),
    avoidTolls: Joi.boolean().default(false),
    departureTime: Joi.date().iso().min('now')
  }),

  // Trip creation
  createTrip: Joi.object({
    origin: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
      address: Joi.string().required()
    }).required(),
    destination: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
      address: Joi.string().required()
    }).required(),
    routeData: Joi.object().required(),
    airQualityData: Joi.array().items(Joi.object({
      location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      aqi: Joi.number().min(0).max(500).required(),
      timestamp: Joi.date().iso()
    })),
    breathabilityScore: Joi.object({
      score: Joi.number().min(0).max(100).required(),
      grade: Joi.string().required(),
      avgAQI: Joi.number().min(0).max(500).required()
    }),
    routeType: Joi.string().valid('fastest', 'healthiest').required()
  }),

  // Trip update
  updateTrip: Joi.object({
    status: Joi.string().valid('planned', 'in_progress', 'completed', 'cancelled'),
    actualDuration: Joi.number().min(0),
    actualDistance: Joi.number().min(0),
    healthActions: Joi.array().items(Joi.string()),
    notes: Joi.string().max(1000)
  }),

  // Coordinates validation
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  })
};

module.exports = {
  validate,
  schemas
};
