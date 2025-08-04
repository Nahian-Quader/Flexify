import { create } from "zustand";

export interface TimeSlot {
	start: string;
	end: string;
}

export interface TrainerAvailability {
	_id: string;
	trainer: {
		_id: string;
		name: string;
		email: string;
		profilePic?: string;
	};
	date: string;
	slots: TimeSlot[];
	availableSlots?: TimeSlot[];
	createdAt: string;
	updatedAt: string;
}

export interface Booking {
	_id: string;
	member: {
		_id: string;
		name: string;
		email: string;
		profilePic?: string;
	};
	trainer: {
		_id: string;
		name: string;
		email: string;
		profilePic?: string;
	};
	date: string;
	slot: TimeSlot;
	status: "booked" | "cancelled" | "completed";
	createdAt: string;
	updatedAt: string;
}

export interface Trainer {
	_id: string;
	name: string;
	email: string;
	profilePic?: string;
}

interface ScheduleState {
	myAvailability: TrainerAvailability[];
	trainers: Trainer[];
	trainerAvailability: TrainerAvailability[];
	myBookings: Booking[];
	trainerBookings: Booking[];
	loading: boolean;
	error: string | null;
}

interface ScheduleActions {
	fetchMyAvailability: () => Promise<void>;
	createAvailability: (date: string, slots: TimeSlot[]) => Promise<void>;
	updateAvailability: (id: string, slots: TimeSlot[]) => Promise<void>;
	deleteAvailability: (id: string) => Promise<void>;
	fetchTrainers: (date?: string) => Promise<void>;
	bookSession: (
		trainerId: string,
		date: string,
		slot: TimeSlot
	) => Promise<void>;
	fetchMyBookings: () => Promise<void>;
	cancelBooking: (id: string) => Promise<void>;
	fetchTrainerBookings: () => Promise<void>;
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

export const useScheduleStore = create<ScheduleState & ScheduleActions>(
	(set, get) => ({
		myAvailability: [],
		trainers: [],
		trainerAvailability: [],
		myBookings: [],
		trainerBookings: [],
		loading: false,
		error: null,

		fetchMyAvailability: async () => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/my-availability`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const data = await response.json();

				if (response.ok) {
					set({
						myAvailability: data.data.availability,
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch availability",
					loading: false,
				});
			}
		},

		createAvailability: async (date: string, slots: TimeSlot[]) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/availability`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ date, slots }),
					}
				);

				const data = await response.json();

				if (response.ok) {
					const currentAvailability = get().myAvailability;
					set({
						myAvailability: [
							...currentAvailability,
							data.data.availability,
						],
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
					throw new Error(data.message);
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to create availability",
					loading: false,
				});
				throw error;
			}
		},

		updateAvailability: async (id: string, slots: TimeSlot[]) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/availability/${id}`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ slots }),
					}
				);

				const data = await response.json();

				if (response.ok) {
					const currentAvailability = get().myAvailability;
					const updatedAvailability = currentAvailability.map(
						(avail) =>
							avail._id === id ? data.data.availability : avail
					);
					set({
						myAvailability: updatedAvailability,
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
					throw new Error(data.message);
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to update availability",
					loading: false,
				});
				throw error;
			}
		},

		deleteAvailability: async (id: string) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/availability/${id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const data = await response.json();

				if (response.ok) {
					const currentAvailability = get().myAvailability;
					const filteredAvailability = currentAvailability.filter(
						(avail) => avail._id !== id
					);
					set({
						myAvailability: filteredAvailability,
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
					throw new Error(data.message);
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to delete availability",
					loading: false,
				});
				throw error;
			}
		},

		fetchTrainers: async (date?: string) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const url = date
					? `${API_URL}/api/schedule/trainers?date=${date}`
					: `${API_URL}/api/schedule/trainers`;

				const response = await fetch(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await response.json();

				if (response.ok) {
					set({
						trainers: data.data.trainers,
						trainerAvailability: data.data.availability,
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch trainers",
					loading: false,
				});
			}
		},

		bookSession: async (
			trainerId: string,
			date: string,
			slot: TimeSlot
		) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(`${API_URL}/api/schedule/book`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ trainerId, date, slot }),
				});

				const data = await response.json();

				if (response.ok) {
					const currentBookings = get().myBookings;
					set({
						myBookings: [...currentBookings, data.data.booking],
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
					throw new Error(data.message);
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to book session",
					loading: false,
				});
				throw error;
			}
		},

		fetchMyBookings: async () => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/my-bookings`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const data = await response.json();

				if (response.ok) {
					set({ myBookings: data.data.bookings, loading: false });
				} else {
					set({ error: data.message, loading: false });
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch bookings",
					loading: false,
				});
			}
		},

		cancelBooking: async (id: string) => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/bookings/${id}/cancel`,
					{
						method: "PATCH",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const data = await response.json();

				if (response.ok) {
					const currentBookings = get().myBookings;
					const updatedBookings = currentBookings.map((booking) =>
						booking._id === id ? data.data.booking : booking
					);
					set({ myBookings: updatedBookings, loading: false });
				} else {
					set({ error: data.message, loading: false });
					throw new Error(data.message);
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to cancel booking",
					loading: false,
				});
				throw error;
			}
		},

		fetchTrainerBookings: async () => {
			set({ loading: true, error: null });
			try {
				const token = getAuthToken();
				const response = await fetch(
					`${API_URL}/api/schedule/trainer-bookings`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const data = await response.json();

				if (response.ok) {
					set({
						trainerBookings: data.data.bookings,
						loading: false,
					});
				} else {
					set({ error: data.message, loading: false });
				}
			} catch (error) {
				set({
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch trainer bookings",
					loading: false,
				});
			}
		},

		clearError: () => set({ error: null }),
	})
);
