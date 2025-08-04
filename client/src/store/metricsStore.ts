import { create } from "zustand";

export interface MetricsData {
	id: string;
	date: string;
	weight: number;
	bodyFat?: number;
	muscleMass?: number;
	waist?: number;
	chest?: number;
	hips?: number;
	biceps?: number;
	thighs?: number;
	height?: number;
	createdAt: string;
	updatedAt: string;
}

interface MetricsState {
	metrics: MetricsData[];
	loading: boolean;
	error: string | null;
}

interface MetricsActions {
	fetchMetrics: (startDate?: string, endDate?: string) => Promise<void>;
	createMetrics: (
		metricsData: Omit<MetricsData, "id" | "createdAt" | "updatedAt">
	) => Promise<void>;
	updateMetrics: (
		id: string,
		metricsData: Partial<MetricsData>
	) => Promise<void>;
	deleteMetrics: (id: string) => Promise<void>;
	clearError: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthToken = () => {
	const authStorage = localStorage.getItem("auth-storage");
	if (authStorage) {
		const parsedStorage = JSON.parse(authStorage);
		return parsedStorage.state?.token;
	}
	return null;
};

export const useMetricsStore = create<MetricsState & MetricsActions>(
	(set, get) => ({
		metrics: [],
		loading: false,
		error: null,

		fetchMetrics: async (startDate?: string, endDate?: string) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				if (!token) {
					throw new Error("No token found");
				}

				let url = `${API_URL}/api/metrics/me`;
				const params = new URLSearchParams();
				if (startDate) params.append("startDate", startDate);
				if (endDate) params.append("endDate", endDate);
				if (params.toString()) url += `?${params.toString()}`;

				const response = await fetch(url, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to fetch metrics");
				}

				set({ metrics: data.data.metrics, loading: false });
			} catch (error) {
				console.error("Fetch metrics error:", error);
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch metrics",
					loading: false,
				});
			}
		},

		createMetrics: async (metricsData) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				if (!token) {
					throw new Error("No token found");
				}

				const response = await fetch(`${API_URL}/api/metrics`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(metricsData),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to create metrics");
				}

				const currentMetrics = get().metrics;
				set({
					metrics: [data.data.metrics, ...currentMetrics],
					loading: false,
				});
			} catch (error) {
				console.error("Create metrics error:", error);
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to create metrics",
					loading: false,
				});
			}
		},

		updateMetrics: async (id, metricsData) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				if (!token) {
					throw new Error("No token found");
				}

				const response = await fetch(`${API_URL}/api/metrics/${id}`, {
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(metricsData),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to update metrics");
				}

				const currentMetrics = get().metrics;
				set({
					metrics: currentMetrics.map((metric) =>
						metric.id === id ? data.data.metrics : metric
					),
					loading: false,
				});
			} catch (error) {
				console.error("Update metrics error:", error);
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to update metrics",
					loading: false,
				});
			}
		},

		deleteMetrics: async (id) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				if (!token) {
					throw new Error("No token found");
				}

				const response = await fetch(`${API_URL}/api/metrics/${id}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Failed to delete metrics");
				}

				const currentMetrics = get().metrics;
				set({
					metrics: currentMetrics.filter(
						(metric) => metric.id !== id
					),
					loading: false,
				});
			} catch (error) {
				console.error("Delete metrics error:", error);
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to delete metrics",
					loading: false,
				});
			}
		},

		clearError: () => set({ error: null }),
	})
);
