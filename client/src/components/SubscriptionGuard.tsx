import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SubscriptionGuardProps {
	children: React.ReactNode;
	fallbackPath?: string;
	showToast?: boolean;
	loadingComponent?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
	children,
	fallbackPath = "/memberships",
	showToast = true,
	loadingComponent,
}) => {
	const { user, isAuthenticated } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const [isLoading, setIsLoading] = useState(true);
	const [hasChecked, setHasChecked] = useState(false);

	useEffect(() => {
		const checkSubscription = async () => {
			if (!isAuthenticated || !user) {
				setIsLoading(false);
				return;
			}

			// Only check subscription for members
			if (user.role === "member") {
				try {
					await fetchUserSubscriptions();
					setHasChecked(true);
				} catch (error) {
					console.error("Error fetching subscriptions:", error);
					if (showToast) {
						toast.error("Unable to verify subscription status");
					}
				}
			}
			setIsLoading(false);
		};

		checkSubscription();
	}, [isAuthenticated, user, fetchUserSubscriptions, showToast]);

	// Show loading while checking subscription
	if (isLoading) {
		return (
			loadingComponent || (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">
							Verifying subscription status...
						</p>
					</div>
				</div>
			)
		);
	}

	// If not authenticated, redirect to login
	if (!isAuthenticated || !user) {
		return <Navigate to="/login" replace />;
	}

	// For non-members (trainers, admins), allow access
	if (user.role !== "member") {
		return <>{children}</>;
	}

	// For members, check subscription status
	if (hasChecked && !hasActiveSubscription(userSubscriptions)) {
		if (showToast) {
			toast.error(
				"You need an active subscription to access this feature"
			);
		}
		return <Navigate to={fallbackPath} replace />;
	}

	return <>{children}</>;
};

export default SubscriptionGuard;
