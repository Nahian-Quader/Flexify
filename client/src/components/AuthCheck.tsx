import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

interface AuthCheckProps {
	children: React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
	const { isAuthenticated, token } = useAuthStore();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			if (token && isAuthenticated) {
				try {
					const API_URL =
						import.meta.env.VITE_API_URL || "http://localhost:5000";
					const response = await fetch(`${API_URL}/api/users/me`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						useAuthStore.getState().logout();
					}
				} catch (error) {
					useAuthStore.getState().logout();
				}
			}
			setIsLoading(false);
		};

		checkAuth();
	}, [token, isAuthenticated]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

export default AuthCheck;
