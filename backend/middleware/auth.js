const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Grant access to protected route
  req.user = currentUser;
  next();
});

// Optional authentication - don't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.userId);
      
      if (currentUser) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid but we don't fail the request
      req.user = null;
    }
  }
  
  next();
});

// Restrict to certain roles/conditions
const restrictTo = (...conditions) => {
  return (req, res, next) => {
    // This can be extended for role-based access
    // For now, we'll just ensure user is authenticated
    if (!req.user) {
      return next(new AppError('Access denied. Please log in.', 403));
    }
    
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  restrictTo
};
