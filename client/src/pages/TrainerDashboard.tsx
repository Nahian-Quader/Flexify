import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import {
	FiActivity,
	FiUsers,
	FiCalendar,
	FiTarget,
	FiClock,
} from "react-icons/fi";
import TrainerAvailabilityManagement from "../components/TrainerAvailabilityManagement";
import TrainerBookings from "../components/TrainerBookings";

const TrainerDashboard = () => {
	const { user } = useAuthStore();
	const [activeTab, setActiveTab] = useState("overview");

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	const tabs = [
		{ id: "overview", name: "Overview", icon: FiActivity },
		{ id: "availability", name: "Manage Availability", icon: FiCalendar },
		{ id: "bookings", name: "My Sessions", icon: FiUsers },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center">
								<FiActivity className="w-8 h-8 mr-3 text-blue-600" />
								Trainer Dashboard
							</h1>
							<p className="mt-2 text-lg text-gray-600">
								Welcome back, {user?.name}! Manage your training
								schedule and sessions.
							</p>
						</div>
						<div className="text-right">
							<div className="text-sm text-gray-500">
								Member since
							</div>
							<div className="text-lg font-medium text-gray-900">
								{user?.createdAt
									? new Date(
											user.createdAt
									  ).toLocaleDateString()
									: "N/A"}
							</div>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<nav className="flex space-x-8">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
										activeTab === tab.id
											? "bg-blue-100 text-blue-700"
											: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
									}`}
								>
									<Icon className="w-4 h-4 mr-2" />
									{tab.name}
								</button>
							);
						})}
					</nav>
				</div>

				{activeTab === "overview" && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="bg-white shadow-lg rounded-lg overflow-hidden">
							<div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
								<h2 className="text-lg font-medium text-gray-900 flex items-center">
									<FiActivity className="w-5 h-5 mr-2 text-blue-600" />
									Trainer Profile
								</h2>
							</div>
							<div className="p-6">
								<div className="flex items-center mb-6">
									{user?.profilePic ? (
										<img
											src={`${API_URL}${user.profilePic}`}
											alt="Profile"
											className="h-16 w-16 rounded-full object-cover"
										/>
									) : (
										<div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
											<FiActivity className="w-8 h-8 text-white" />
										</div>
									)}
									<div className="ml-4">
										<h3 className="text-lg font-medium text-gray-900">
											{user?.name}
										</h3>
										<p className="text-sm text-gray-500">
											{user?.email}
										</p>
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
											{user?.role}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white shadow-lg rounded-lg overflow-hidden">
							<div className="px-6 py-4 border-b border-gray-200 bg-green-50">
								<h2 className="text-lg font-medium text-gray-900 flex items-center">
									<FiTarget className="w-5 h-5 mr-2 text-green-600" />
									Quick Actions
								</h2>
							</div>
							<div className="p-6 space-y-4">
								<button
									onClick={() => setActiveTab("availability")}
									className="w-full p-4 text-left rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										<FiCalendar className="w-6 h-6 text-blue-600 mr-3" />
										<div>
											<h4 className="font-medium text-blue-900">
												Manage Availability
											</h4>
											<p className="text-sm text-blue-700">
												Set your available time slots
												for training sessions
											</p>
										</div>
									</div>
								</button>

								<button
									onClick={() => setActiveTab("bookings")}
									className="w-full p-4 text-left rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors duration-200"
								>
									<div className="flex items-center">
										<FiUsers className="w-6 h-6 text-green-600 mr-3" />
										<div>
											<h4 className="font-medium text-green-900">
												View Sessions
											</h4>
											<p className="text-sm text-green-700">
												Manage your scheduled training
												sessions
											</p>
										</div>
									</div>
								</button>

								<div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
									<div className="flex items-center">
										<FiClock className="w-6 h-6 text-gray-400 mr-3" />
										<div>
											<h4 className="font-medium text-gray-500">
												Workout Programs
											</h4>
											<p className="text-sm text-gray-400">
												Coming soon - Create and assign
												workout programs
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === "availability" && (
					<TrainerAvailabilityManagement />
				)}
				{activeTab === "bookings" && <TrainerBookings />}
			</main>
		</div>
	);
};

export default TrainerDashboard;
