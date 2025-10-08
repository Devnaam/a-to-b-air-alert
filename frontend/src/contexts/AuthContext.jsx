import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "../services/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if user is logged in on app start
	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem("authToken");

			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const response = await authAPI.verifyToken();
				if (response.status === "success") {
					setUser(response.data.user);
					console.log("✅ User verified:", response.data.user);
				}
			} catch (error) {
				console.error("Token verification failed:", error);
				localStorage.removeItem("authToken");
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	const login = async (credentials) => {
		try {
			setError(null);
			setLoading(true);

			const response = await authAPI.login(credentials);

			if (response.status === "success") {
				setUser(response.data.user);
				localStorage.setItem("authToken", response.data.token);
				return { success: true };
			}
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Login failed";
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	};

	const signup = async (userData) => {
		try {
			setError(null);
			setLoading(true);

			const response = await authAPI.register(userData);

			if (response.status === "success") {
				setUser(response.data.user);
				localStorage.setItem("authToken", response.data.token);
				console.log("✅ User registered successfully:", response.data.user);
				return { success: true };
			}
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || "Registration failed";
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			console.log("🔄 Logging out user...");
			await authAPI.logout();
		} catch (error) {
			console.error("Logout API error:", error);
		} finally {
			// ✅ Always clear user state and token, even if API call fails
			setUser(null);
			setError(null);
			localStorage.removeItem("authToken");
			console.log("✅ User logged out and data cleared");
		}
	};

	// ✅ Enhanced updateProfile function
	const updateProfile = async (profileData) => {
		try {
			setError(null);
			console.log("🔄 Updating profile:", profileData);

			const response = await authAPI.updateProfile(profileData);

			if (response.status === "success") {
				setUser(response.data.user);
				console.log("✅ Profile updated successfully:", response.data.user);
				return { success: true };
			}
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || "Profile update failed";
			setError(errorMessage);
			console.error("❌ Profile update failed:", error);
			return { success: false, error: errorMessage };
		}
	};

	const value = {
		user,
		loading,
		error,
		login,
		signup,
		logout,
		updateProfile,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
