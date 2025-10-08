const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
	let token;

	// Check for token in Authorization header or cookies
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	// For /profile endpoint, allow access without token
	if (!token && req.path === "/profile") {
		return next();
	}

	// For other protected routes, require token
	if (!token) {
		return next(new AppError("Please log in to access this route", 401));
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Check if user exists
		const user = await User.findById(decoded.id);
		if (!user) {
			return next(new AppError("User no longer exists", 401));
		}

		// Add user to request
		req.user = user;
		next();
	} catch (error) {
		if (req.path === "/profile") {
			return next(); // Allow access to /profile without valid token
		}
		return next(new AppError("Invalid token", 401));
	}
});

// Optional authentication - don't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];

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
			return next(new AppError("Access denied. Please log in.", 403));
		}

		next();
	};
};

module.exports = {
	protect,
	optionalAuth,
	restrictTo,
};
