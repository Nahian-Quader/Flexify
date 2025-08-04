import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "trainer" | "member";
	profilePic?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	loading: boolean;
	error: string | null;
	isAuthenticated: boolean;
}

interface AuthActions {
	login: (email: string, password: string) => Promise<void>;
	register: (formData: FormData) => Promise<void>;
	logout: () => void;
	clearError: () => void;
	updateProfile: (formData: FormData) => Promise<void>;
	setLoading: (loading: boolean) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			loading: false,
			error: null,
			isAuthenticated: false,

			login: async (email: string, password: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(`${API_URL}/api/auth/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password }),
					});

					const data = await response.json();

					if (!response.ok) {
						throw new Error(data.message || "Login failed");
					}

					set({
						user: data.data.user,
						token: data.data.token,
						isAuthenticated: true,
						loading: false,
						error: null,
					});
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "Login failed",
					});
					throw error;
				}
			},

			register: async (formData: FormData) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`${API_URL}/api/auth/register`,
						{
							method: "POST",
							body: formData,
						}
					);

					const data = await response.json();

					if (!response.ok) {
						throw new Error(data.message || "Registration failed");
					}

					set({
						user: data.data.user,
						token: data.data.token,
						isAuthenticated: true,
						loading: false,
						error: null,
					});
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "Registration failed",
					});
					throw error;
				}
			},

			updateProfile: async (formData: FormData) => {
				const { token } = get();
				if (!token) throw new Error("Not authenticated");

				set({ loading: true, error: null });
				try {
					const response = await fetch(`${API_URL}/api/users/me`, {
						method: "PATCH",
						headers: {
							Authorization: `Bearer ${token}`,
						},
						body: formData,
					});

					const data = await response.json();

					if (!response.ok) {
						throw new Error(
							data.message || "Profile update failed"
						);
					}

					set({
						user: data.data.user,
						loading: false,
						error: null,
					});
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "Profile update failed",
					});
					throw error;
				}
			},

			logout: () => {
				set({
					user: null,
					token: null,
					isAuthenticated: false,
					loading: false,
					error: null,
				});
			},

			clearError: () => {
				set({ error: null });
			},

			setLoading: (loading: boolean) => {
				set({ loading });
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
