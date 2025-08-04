import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const { login, loading, error } = useAuthStore();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(formData.email, formData.password);
			toast.success("Login successful!");

			const { user } = useAuthStore.getState();
			if (user?.role === "admin") {
				navigate("/admin");
			} else if (user?.role === "trainer") {
				navigate("/trainer");
			} else {
				navigate("/dashboard");
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Login failed"
			);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
						Sign in to Flexify
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								placeholder="Email address"
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								value={formData.password}
								onChange={handleChange}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								placeholder="Password"
							/>
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center">
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{" "}
							<Link
								to="/register"
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								Sign up
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
