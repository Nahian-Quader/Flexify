import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";

export const useSubscriptionGuard = (requiresSubscription: boolean = true) => {
	const { user, isAuthenticated } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkSubscription = async () => {
			// If not authenticated, redirect to login
			if (!isAuthenticated || !user) {
				navigate("/login");
				return;
			}

			// If subscription is required and user is a member
			if (requiresSubscription && user.role === "member") {
				setIsLoading(true);
				try {
					await fetchUserSubscriptions();

					// Check subscription status after fetching
					if (!hasActiveSubscription(userSubscriptions)) {
						toast.error(
							"You need an active subscription to access this feature"
						);
						navigate("/memberships");
						return;
					}
				} catch (error) {
					console.error("Error fetching subscriptions:", error);
					toast.error("Unable to verify subscription status");
					navigate("/memberships");
					return;
				} finally {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		};

		checkSubscription();
	}, [
		isAuthenticated,
		user,
		requiresSubscription,
		navigate,
		fetchUserSubscriptions,
	]);

	// Re-check when userSubscriptions change
	useEffect(() => {
		if (requiresSubscription && user?.role === "member" && !isLoading) {
			if (!hasActiveSubscription(userSubscriptions)) {
				toast.error(
					"Your subscription has expired. Please renew to continue."
				);
				navigate("/memberships");
			}
		}
	}, [userSubscriptions, requiresSubscription, user, navigate, isLoading]);

	const userHasActiveSubscription = hasActiveSubscription(userSubscriptions);

	return {
		user,
		isAuthenticated,
		userHasActiveSubscription,
		userSubscriptions,
		isLoading,
	};
};
