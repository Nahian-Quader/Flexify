import type { UserSubscription } from "../store/membershipStore";

export const hasActiveSubscription = (
	subscriptions: UserSubscription[]
): boolean => {
	return subscriptions.some(
		(subscription) => subscription.status === "active"
	);
};

export const getActiveSubscription = (
	subscriptions: UserSubscription[]
): UserSubscription | null => {
	return (
		subscriptions.find(
			(subscription) => subscription.status === "active"
		) || null
	);
};
