const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.registerUser), authController.register);
router.post('/login', validate(schemas.loginUser), authController.login);
router.post('/verify-token', authController.verifyToken);

// Protected routes
router.post('/refresh-token', protect, authController.refreshToken);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);

module.exports = router;
