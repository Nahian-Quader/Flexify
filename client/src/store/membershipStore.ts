import { create } from "zustand";

export interface MembershipPlan {
	id: string;
	name: string;
	durationInMonths: number;
	price: number;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface UserSubscription {
	id: string;
	membershipPlan: MembershipPlan;
	startDate: string;
	endDate: string;
	status: "active" | "expired";
	createdAt: string;
	updatedAt: string;
}

export interface AdminSubscription extends UserSubscription {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
}

interface MembershipState {
	plans: MembershipPlan[];
	userSubscriptions: UserSubscription[];
	adminSubscriptions: AdminSubscription[];
	loading: boolean;
	error: string | null;
}

interface MembershipActions {
	fetchPlans: () => Promise<void>;
	createPlan: (
		planData: Omit<MembershipPlan, "id" | "createdAt" | "updatedAt">
	) => Promise<void>;
	updatePlan: (
		id: string,
		planData: Partial<MembershipPlan>
	) => Promise<void>;
	deletePlan: (id: string) => Promise<void>;
	fetchUserSubscriptions: () => Promise<void>;
	createSubscription: (membershipPlanId: string) => Promise<void>;
	fetchAdminSubscriptions: (status?: "active" | "expired") => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useMembershipStore = create<MembershipState & MembershipActions>(
	(set, get) => ({
		plans: [],
		userSubscriptions: [],
		adminSubscriptions: [],
		loading: false,
		error: null,

		fetchPlans: async () => {
			set({ loading: true, error: null });
			try {
				const response = await fetch(`${API_URL}/api/memberships`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to fetch membership plans"
					);
				}

				set({ plans: data.data.plans, loading: false });
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch membership plans",
				});
			}
		},

		createPlan: async (planData) => {
			const token = localStorage.getItem("auth-storage");
			if (!token) throw new Error("Not authenticated");

			const authData = JSON.parse(token);
			if (!authData.state?.token) throw new Error("Not authenticated");

			set({ loading: true, error: null });
			try {
				const response = await fetch(`${API_URL}/api/memberships`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authData.state.token}`,
					},
					body: JSON.stringify(planData),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to create membership plan"
					);
				}

				const { plans } = get();
				set({
					plans: [...plans, data.data.plan],
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to create membership plan",
				});
				throw error;
			}
		},

		updatePlan: async (id, planData) => {
			const token = localStorage.getItem("auth-storage");
			if (!token) throw new Error("Not authenticated");

			const authData = JSON.parse(token);
			if (!authData.state?.token) throw new Error("Not authenticated");

			set({ loading: true, error: null });
			try {
				const response = await fetch(
					`${API_URL}/api/memberships/${id}`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authData.state.token}`,
						},
						body: JSON.stringify(planData),
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to update membership plan"
					);
				}

				const { plans } = get();
				set({
					plans: plans.map((plan) =>
						plan.id === id ? data.data.plan : plan
					),
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to update membership plan",
				});
				throw error;
			}
		},

		deletePlan: async (id) => {
			const token = localStorage.getItem("auth-storage");
			if (!token) throw new Error("Not authenticated");

			const authData = JSON.parse(token);
			if (!authData.state?.token) throw new Error("Not authenticated");

			set({ loading: true, error: null });
			try {
				const response = await fetch(
					`${API_URL}/api/memberships/${id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${authData.state.token}`,
						},
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to delete membership plan"
					);
				}

				const { plans } = get();
				set({
					plans: plans.filter((plan) => plan.id !== id),
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to delete membership plan",
				});
				throw error;
			}
		},

		fetchUserSubscriptions: async () => {
			const token = localStorage.getItem("auth-storage");
			if (!token) throw new Error("Not authenticated");

			const authData = JSON.parse(token);
			if (!authData.state?.token || !authData.state?.user)
				throw new Error("Not authenticated");

			// Check if user is a member
			if (authData.state.user.role !== "member") {
				set({ userSubscriptions: [], loading: false, error: null });
				return;
			}

			set({ loading: true, error: null });
			try {
				const response = await fetch(
					`${API_URL}/api/subscriptions/me`,
					{
						headers: {
							Authorization: `Bearer ${authData.state.token}`,
						},
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to fetch subscriptions"
					);
				}

				set({
					userSubscriptions: data.data.subscriptions,
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch subscriptions",
				});
			}
		},

		createSubscription: async (membershipPlanId) => {
			const token = localStorage.getItem("auth-storage");
			if (!token) throw new Error("Not authenticated");

			const authData = JSON.parse(token);
			if (!authData.state?.token || !authData.state?.user)
				throw new Error("Not authenticated");

			// Check if user is a member
			if (authData.state.user.role !== "member") {
				throw new Error(
					"Subscription features are only available for members"
				);
			}

			set({ loading: true, error: null });
			try {
				const response = await fetch(`${API_URL}/api/subscriptions`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authData.state.token}`,
					},
					body: JSON.stringify({ membershipPlanId }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to create subscription"
					);
				}

				const { userSubscriptions } = get();
				set({
					userSubscriptions: [
						data.data.subscription,
						...userSubscriptions,
					],
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to create subscription",
				});
				throw error;
			}
		},

		fetchAdminSubscriptions: async (status) => {
			const token = localStorage.getItem("auth-storage");
			if (!token) throw new Error("Not authenticated");

			const authData = JSON.parse(token);
			if (!authData.state?.token) throw new Error("Not authenticated");

			set({ loading: true, error: null });
			try {
				const url = status
					? `${API_URL}/api/subscriptions?status=${status}`
					: `${API_URL}/api/subscriptions`;

				const response = await fetch(url, {
					headers: {
						Authorization: `Bearer ${authData.state.token}`,
					},
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to fetch subscriptions"
					);
				}

				set({
					adminSubscriptions: data.data.subscriptions,
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch subscriptions",
				});
			}
		},

		clearError: () => {
			set({ error: null });
		},

		setLoading: (loading: boolean) => {
			set({ loading });
		},
	})
);
