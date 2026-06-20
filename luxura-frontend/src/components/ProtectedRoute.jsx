import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="min-h-screen bg-luxury-bg flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	if (!user) {
		// Redirect to login, tracking where they were trying to go
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children;
};
