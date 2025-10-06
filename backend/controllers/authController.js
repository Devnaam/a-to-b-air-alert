const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Send response with token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user.id);
  
  // Remove password from output
  delete user.password_hash;
  
  res.status(statusCode).json({
    status: 'success',
    message,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        healthProfile: user.health_profile,
        preferences: user.preferences,
        createdAt: user.created_at
      }
    }
  });
};

// Register new user
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Create new user
  const user = await User.create({ name, email, password });
  
  logger.info(`New user registered: ${email}`);
  
  createSendToken(user, 201, res, 'User registered successfully');
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for verification
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  logger.info(`User logged in: ${email}`);
  
  createSendToken(user, 200, res, 'Login successful');
});

// Verify token and get user data
exports.verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          healthProfile: user.health_profile,
          preferences: user.preferences,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired token', 401);
    }
    throw error;
  }
});

// Refresh token
exports.refreshToken = asyncHandler(async (req, res) => {
  const user = req.user; // From auth middleware
  
  const newToken = generateToken(user.id);
  
  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: {
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        healthProfile: user.health_profile,
        preferences: user.preferences
      }
    }
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get user with password
  const user = await User.findByEmail(req.user.email);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  await User.updatePassword(userId, newPassword);
  
  logger.info(`Password changed for user: ${user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});

// Logout (client-side token removal)
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get user profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user statistics
  const stats = await User.getStats(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        healthProfile: user.health_profile,
        preferences: user.preferences,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      stats
    }
  });
});
