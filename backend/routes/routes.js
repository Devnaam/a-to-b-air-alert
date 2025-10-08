const express = require('express');
const routeController = require('../controllers/routeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes (with optional authentication for better personalization)
router.post('/plan', 
  optionalAuth, 
  validate(schemas.planRoute), 
  routeController.planRoute
);

// Geocode endpoint - expects address, not coordinates
router.post('/geocode', 
  validate(schemas.geocodeAddress),  // Use correct schema
  routeController.geocode
);

// Reverse geocode endpoint - expects coordinates
router.post('/reverse-geocode',
  validate(schemas.coordinates),  // This one is correct
  routeController.reverseGeocode
);

router.get('/popular', routeController.getPopularRoutes);

router.get('/stats', routeController.getRouteStats);

// Routes that can benefit from user context
router.post('/analyze',
  optionalAuth,
  routeController.analyzeRoute
);

router.post('/time-recommendations',
  optionalAuth,
  routeController.getTimeRecommendations
);

// Protected routes
router.get('/cached/:routeHash', protect, routeController.getCachedRoute);

module.exports = router;
