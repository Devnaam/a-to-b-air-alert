const express = require('express');
const tripController = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// Trip CRUD operations
router.post('/', 
  validate(schemas.createTrip), 
  tripController.createTrip
);

router.get('/', tripController.getUserTrips);

router.get('/stats', tripController.getTripStats);

router.get('/exposure-analysis', tripController.getExposureAnalysis);

router.get('/insights', tripController.getTripInsights);

router.get('/:tripId', tripController.getTrip);

router.put('/:tripId', 
  validate(schemas.updateTrip), 
  tripController.updateTrip
);

router.delete('/:tripId', tripController.deleteTrip);

// Trip status management
router.post('/:tripId/start', tripController.startTrip);

router.post('/:tripId/complete', tripController.completeTrip);

router.post('/:tripId/cancel', tripController.cancelTrip);

// Real-time trip updates
router.put('/:tripId/air-quality', tripController.updateTripAirQuality);

module.exports = router;
