const express = require("express");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Middleware
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Global error handler
app.use((err, req, res, next) => {
	console.error("Error:", err);

	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		error: err,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});
});

module.exports = app;
