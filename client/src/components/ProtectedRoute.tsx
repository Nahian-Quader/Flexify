import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
	requiresSubscription?: boolean;
}

const ProtectedRoute = ({
	children,
	allowedRoles,
	requiresSubscription = false,
}: ProtectedRouteProps) => {
	const { isAuthenticated, user } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const [subscriptionsLoaded, setSubscriptionsLoaded] = useState(false);

	useEffect(() => {
		if (
			isAuthenticated &&
			user?.role === "member" &&
			requiresSubscription
		) {
			fetchUserSubscriptions().finally(() =>
				setSubscriptionsLoaded(true)
			);
		} else {
			setSubscriptionsLoaded(true);
		}
	}, [
		isAuthenticated,
		user?.role,
		requiresSubscription,
		fetchUserSubscriptions,
	]);

	if (!isAuthenticated || !user) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	// If subscription is required and user is a member
	if (requiresSubscription && user.role === "member") {
		// Show loading while fetching subscriptions
		if (!subscriptionsLoaded) {
			return (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">
							Loading subscription status...
						</p>
					</div>
				</div>
			);
		}

		// Redirect to memberships if no active subscription
		if (!hasActiveSubscription(userSubscriptions)) {
			return <Navigate to="/memberships" replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
