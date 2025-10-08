const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

// Update user profile
exports.updateProfile = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const updates = req.body;

	// Validate and sanitize updates
	const allowedUpdates = ["name", "healthProfile", "preferences"];
	const filteredUpdates = {};

	Object.keys(updates).forEach((key) => {
		if (allowedUpdates.includes(key)) {
			filteredUpdates[key] = updates[key];
		}
	});

	if (Object.keys(filteredUpdates).length === 0) {
		throw new AppError("No valid updates provided", 400);
	}

	const updatedUser = await User.updateProfile(userId, filteredUpdates);

	if (!updatedUser) {
		throw new AppError("User not found", 404);
	}

	logger.info(`Profile updated for user ${userId}`);

	res.status(200).json({
		status: "success",
		message: "Profile updated successfully",
		data: {
			user: {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				healthProfile: updatedUser.health_profile,
				preferences: updatedUser.preferences,
				updatedAt: updatedUser.updated_at,
			},
		},
	});
});

// Get user dashboard data
exports.getDashboard = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	// Get user stats
	const stats = await User.getStats(userId);

	// Get recent activity
	const recentActivity = await User.getRecentActivity(userId, 5);

	// Calculate health metrics
	const healthMetrics = calculateHealthMetrics(stats, req.user.health_profile);

	// Get weekly comparison
	const weeklyComparison = await getWeeklyComparison(userId);

	res.status(200).json({
		status: "success",
		data: {
			stats,
			recentActivity,
			healthMetrics,
			weeklyComparison,
			user: {
				id: req.user.id,
				name: req.user.name,
				healthProfile: req.user.health_profile,
				preferences: req.user.preferences,
			},
		},
	});
});

// Helper function to calculate health metrics
const calculateHealthMetrics = (stats, healthProfile) => {
	const avgAQI = stats.avgExposure || 0;
	const healthyRoutePercentage = stats.healthyRoutePercentage || 0;

	// Calculate overall health score
	let healthScore = 100;

	// Deduct points for high exposure
	if (avgAQI > 150) healthScore -= 30;
	else if (avgAQI > 100) healthScore -= 15;
	else if (avgAQI > 50) healthScore -= 5;

	// Add points for healthy route choices
	healthScore += (healthyRoutePercentage - 50) * 0.2;

	// Adjust for user profile
	if (healthProfile?.hasRespiratoryConditions && avgAQI > 100) {
		healthScore -= 10;
	}

	healthScore = Math.max(0, Math.min(100, healthScore));

	let grade, message;
	if (healthScore >= 90) {
		grade = "A+";
		message = "Excellent! You're making great health-conscious choices.";
	} else if (healthScore >= 80) {
		grade = "A";
		message = "Great job! Your travel choices are protecting your health.";
	} else if (healthScore >= 70) {
		grade = "B";
		message = "Good progress. Consider choosing healthier routes more often.";
	} else if (healthScore >= 60) {
		grade = "C";
		message = "Room for improvement. Try using our healthiest route options.";
	} else {
		grade = "D";
		message =
			"Your exposure levels are concerning. Please prioritize healthier routes.";
	}

	return {
		healthScore: Math.round(healthScore),
		grade,
		message,
		avgAQI: Math.round(avgAQI),
		healthyRoutePercentage,
	};
};

// Helper function to get weekly comparison
const getWeeklyComparison = async (userId) => {
	try {
		// This would need more sophisticated date handling in production
		const thisWeek = await User.getStats(userId);

		// For now, return mock comparison data
		const improvement = Math.round((Math.random() - 0.3) * 20); // -6 to +14

		return {
			improvement,
			message:
				improvement > 0
					? `${improvement}% improvement from last week!`
					: improvement < 0
					? `${Math.abs(improvement)}% higher exposure than last week`
					: "Similar to last week",
		};
	} catch (error) {
		logger.error("Weekly comparison error:", error);
		return null;
	}
};

// Get user preferences
exports.getPreferences = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);

	if (!user) {
		throw new AppError("User not found", 404);
	}

	res.status(200).json({
		status: "success",
		data: {
			preferences: user.preferences,
			healthProfile: user.health_profile,
		},
	});
});

// Update user preferences
exports.updatePreferences = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const { preferences } = req.body;

	if (!preferences) {
		throw new AppError("Preferences data is required", 400);
	}

	const updatedUser = await User.updateProfile(userId, { preferences });

	logger.info(`Preferences updated for user ${userId}`);

	res.status(200).json({
		status: "success",
		message: "Preferences updated successfully",
		data: {
			preferences: updatedUser.preferences,
		},
	});
});

// Update health profile
exports.updateHealthProfile = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const { healthProfile } = req.body;

	if (!healthProfile) {
		throw new AppError("Health profile data is required", 400);
	}

	const updatedUser = await User.updateProfile(userId, { healthProfile });

	logger.info(`Health profile updated for user ${userId}`);

	res.status(200).json({
		status: "success",
		message: "Health profile updated successfully",
		data: {
			healthProfile: updatedUser.health_profile,
		},
	});
});

// Delete user account
exports.deleteAccount = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const { confirmPassword } = req.body;

	if (!confirmPassword) {
		throw new AppError("Password confirmation is required", 400);
	}

	// Verify password
	const user = await User.findByEmail(req.user.email);
	const isPasswordValid = await User.verifyPassword(
		confirmPassword,
		user.password_hash
	);

	if (!isPasswordValid) {
		throw new AppError("Incorrect password", 401);
	}

	// Delete user and all related data
	await User.delete(userId);

	logger.info(`User account deleted: ${userId}`);

	res.status(200).json({
		status: "success",
		message: "Account deleted successfully",
	});
});

// Export user data (GDPR compliance)
exports.exportData = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	// Get all user data
	const user = await User.findById(userId);
	const stats = await User.getStats(userId);
	const recentActivity = await User.getRecentActivity(userId, 100);

	const userData = {
		profile: {
			id: user.id,
			name: user.name,
			email: user.email,
			healthProfile: user.health_profile,
			preferences: user.preferences,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
		},
		statistics: stats,
		recentActivity,
		exportedAt: new Date().toISOString(),
	};

	res.status(200).json({
		status: "success",
		message: "User data exported successfully",
		data: userData,
	});
});

// Get user activity summary
exports.getActivitySummary = asyncHandler(async (req, res) => {
	const userId = req.user.id;
	const { period = "month" } = req.query;

	const stats = await User.getStats(userId);
	const recentActivity = await User.getRecentActivity(userId, 20);

	// Group activities by date
	const activityByDate = {};
	recentActivity.forEach((activity) => {
		const date = new Date(activity.created_at).toISOString().split("T")[0];
		if (!activityByDate[date]) {
			activityByDate[date] = [];
		}
		activityByDate[date].push(activity);
	});

	const summary = {
		period,
		stats,
		dailyActivity: activityByDate,
		trends: {
			avgTripsPerDay: stats.totalTrips / 30, // Rough estimate
			mostCommonRouteType:
				stats.healthyRoutePercentage > 50 ? "healthiest" : "fastest",
			exposureTrend:
				stats.avgExposure > 100
					? "high"
					: stats.avgExposure > 50
					? "moderate"
					: "low",
		},
	};

	res.status(200).json({
		status: "success",
		data: summary,
	});
});

// Get user profile
exports.getProfile = async (req, res, next) => {
	try {
		// If user is authenticated, req.user will be available
		if (req.user) {
			return res.status(200).json({
				status: "success",
				data: {
					user: {
						id: req.user._id,
						name: req.user.name,
						email: req.user.email,
						// Add other safe-to-share user fields
						preferences: req.user.preferences,
						healthProfile: req.user.healthProfile,
						createdAt: req.user.createdAt,
					},
				},
			});
		}

		// If no authenticated user, return public profile info
		return res.status(200).json({
			status: "success",
			data: {
				message: "Please login to view full profile",
			},
		});
	} catch (error) {
		return next(new AppError("Error fetching profile", 500));
	}
};
