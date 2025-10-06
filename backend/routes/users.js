const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Profile management
router.get('/dashboard', userController.getDashboard);

router.put('/profile', 
  validate(schemas.updateProfile), 
  userController.updateProfile
);

router.get('/preferences', userController.getPreferences);

router.put('/preferences', userController.updatePreferences);

router.put('/health-profile', userController.updateHealthProfile);

// Activity and analytics
router.get('/activity-summary', userController.getActivitySummary);

// Account management
router.get('/export-data', userController.exportData);

router.delete('/account', userController.deleteAccount);

module.exports = router;
