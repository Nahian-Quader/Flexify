import { create } from "zustand";

export interface AttendanceRecord {
	id: string;
	user: {
		id: string;
		name: string;
		email: string;
		profilePic?: string;
	};
	checkInTime: string;
	date: string;
}

export interface AttendanceStatus {
	user: {
		id: string;
		name: string;
		email: string;
	};
	todayStatus: {
		checkInTime: string;
	} | null;
	hasCheckedIn: boolean;
}

interface AttendanceState {
	attendanceRecords: AttendanceRecord[];
	currentUserStatus: AttendanceStatus | null;
	loading: boolean;
	error: string | null;
}

interface AttendanceActions {
	checkIn: (userId: string) => Promise<void>;
	getUserStatus: (userId: string) => Promise<void>;
	getAttendanceLogs: (filters?: {
		startDate?: string;
		endDate?: string;
		userId?: string;
	}) => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useAttendanceStore = create<AttendanceState & AttendanceActions>()(
	(set, get) => ({
		attendanceRecords: [],
		currentUserStatus: null,
		loading: false,
		error: null,

		checkIn: async (userId: string) => {
			set({ loading: true, error: null });
			try {
				const response = await fetch(
					`${API_URL}/api/attendance/checkin`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ userId }),
					}
				);

				const data = await response.json();

				if (!data.success) {
					throw new Error(data.message);
				}

				await get().getUserStatus(userId);
				set({ loading: false });
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Check-in failed",
				});
				throw error;
			}
		},

		getUserStatus: async (userId: string) => {
			set({ loading: true, error: null });
			try {
				const response = await fetch(
					`${API_URL}/api/attendance/status/${userId}`
				);

				const data = await response.json();

				if (!data.success) {
					throw new Error(data.message);
				}

				set({
					currentUserStatus: data.data,
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch status",
				});
			}
		},

		getAttendanceLogs: async (filters = {}) => {
			set({ loading: true, error: null });
			try {
				const token = localStorage.getItem("auth-storage");
				if (!token) {
					throw new Error("No authentication token found");
				}

				const parsedToken = JSON.parse(token);
				const authToken = parsedToken.state?.token;

				if (!authToken) {
					throw new Error("No authentication token found");
				}

				const queryParams = new URLSearchParams();
				if (filters.startDate)
					queryParams.append("startDate", filters.startDate);
				if (filters.endDate)
					queryParams.append("endDate", filters.endDate);
				if (filters.userId)
					queryParams.append("userId", filters.userId);

				const response = await fetch(
					`${API_URL}/api/attendance/logs?${queryParams.toString()}`,
					{
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
					}
				);

				const data = await response.json();

				if (!data.success) {
					throw new Error(data.message);
				}

				set({
					attendanceRecords: data.data.logs,
					loading: false,
				});
			} catch (error) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch attendance logs",
				});
			}
		},

		clearError: () => set({ error: null }),

		setLoading: (loading: boolean) => set({ loading }),
	})
);
