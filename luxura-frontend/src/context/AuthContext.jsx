import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("luxura_token") || null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user token exists and fetch current user profile
		const verifyUser = async () => {
			if (!token) {
				setLoading(false);
				return;
			}
			try {
				const response = await fetch("/api/auth/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (response.ok) {
					const data = await response.json();

					// FIX: Target data.data.user to correctly bind the user document
					setUser(data.data.user);
				} else {
					logout();
				}
			} catch (error) {
				console.error("Auth verification failed:", error);
			} finally {
				setLoading(false);
			}
		};

		verifyUser();
	}, [token]);

	const login = (userData, userToken) => {
		localStorage.setItem("luxura_token", userToken);
		setToken(userToken);
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem("luxura_token");
		setToken(null);
		setUser(null);
	};

	return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
