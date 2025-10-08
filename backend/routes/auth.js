const express = require("express");
const router = express.Router();

// Add debug routes (working)
router.get("/debug", (req, res) => {
	res.json({ message: "Auth routes working!" });
});

router.get("/test", (req, res) => {
	res.json({
		status: "success",
		message: "Auth routes loaded successfully!",
	});
});

// Add a base route for /api/auth/
router.get("/", (req, res) => {
	res.json({
		status: "success",
		message: "Auth API endpoints",
		endpoints: {
			"POST /register": "User registration",
			"POST /login": "User login",
			"POST /verify-token": "Token verification",
			"GET /profile": "Get user profile (requires auth)",
		},
	});
});

// Import controllers and middleware
let authController, protect, validate, schemas;

try {
	authController = require("../controllers/authController");
	console.log("✅ Auth controller loaded");
} catch (error) {
	console.log("❌ Auth controller NOT found:", error.message);
}

try {
	const auth = require("../middleware/auth");
	protect = auth.protect;
	console.log("✅ Auth middleware loaded");
} catch (error) {
	console.log("❌ Auth middleware NOT found:", error.message);
}

try {
	const validation = require("../middleware/validation");
	validate = validation.validate;
	schemas = validation.schemas;
	console.log("✅ Validation middleware loaded");
} catch (error) {
	console.log("❌ Validation middleware NOT found:", error.message);
}

// ✅ ROUTES WITH PROPER VALIDATION
if (authController && validate && schemas) {
	console.log("✅ Adding auth routes with validation...");

	// Public routes with validation
	router.post(
		"/register",
		validate(schemas.registerUser),
		authController.register
	);
	router.post("/login", validate(schemas.loginUser), authController.login);
	router.post("/verify-token", authController.verifyToken);

	if (protect) {
		// Protected routes
		router.post("/refresh-token", protect, authController.refreshToken);
		router.post("/change-password", protect, authController.changePassword);
		router.post("/logout", protect, authController.logout);
		router.get("/me", protect, authController.getProfile);
		router.get("/profile", protect, authController.getProfile);
	}
} else {
	console.log("❌ Missing dependencies, only debug routes available");
}

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.use(protect);
router.get("/profile", authController.getProfile);
router.get("/logout", authController.logout);

// Essential: Export the router
module.exports = router;
