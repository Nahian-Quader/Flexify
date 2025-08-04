import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import {
	hasActiveSubscription,
	getActiveSubscription,
} from "../lib/subscriptionUtils";
import {
	FiUser,
	FiCalendar,
	FiUsers,
	FiClock,
	FiPlus,
	FiGift,
	FiAlertCircle,
	FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import UserSubscriptions from "../components/UserSubscriptions";

const Dashboard = () => {
	const { user } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const navigate = useNavigate();

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	useEffect(() => {
		if (user?.role === "member") {
			fetchUserSubscriptions();
		}
	}, [user, fetchUserSubscriptions]);

	const handleTrainerNavigation = () => {
		if (
			user?.role === "member" &&
			!hasActiveSubscription(userSubscriptions)
		) {
			navigate("/membership-plans");
			return;
		}
		navigate("/trainers");
	};

	const handleBookingsNavigation = () => {
		if (
			user?.role === "member" &&
			!hasActiveSubscription(userSubscriptions)
		) {
			navigate("/membership-plans");
			return;
		}
		navigate("/my-bookings");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Welcome back, {user?.name}!
					</h1>
					<p className="mt-2 text-lg text-gray-600">
						You are logged in as a{" "}
						<span className="font-semibold text-blue-600">
							{user?.role}
						</span>
						.
					</p>
				</div>

				{/* Subscription Status Banner for Members */}
				{user?.role === "member" && (
					<div className="mb-6">
						{hasActiveSubscription(userSubscriptions) ? (
							<div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
								<div className="flex items-center">
									<FiCheckCircle className="w-5 h-5 text-green-600 mr-3" />
									<div>
										<h3 className="text-sm font-medium text-green-800">
											Active Subscription
										</h3>
										<p className="text-sm text-green-700">
											You have full access to all premium
											features including trainers,
											bookings, and attendance tracking.
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
										<div>
											<h3 className="text-sm font-medium text-yellow-800">
												No Active Subscription
											</h3>
											<p className="text-sm text-yellow-700">
												Subscribe to a membership plan
												to access trainers, book
												sessions, and track attendance.
											</p>
										</div>
									</div>
									<button
										onClick={() => navigate("/memberships")}
										className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
									>
										<FiGift className="w-4 h-4 mr-1" />
										View Plans
									</button>
								</div>
							</div>
						)}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Profile Card */}
					<div
						className={
							user?.role === "member"
								? "lg:col-span-1"
								: "lg:col-span-3"
						}
					>
						<div className="bg-white overflow-hidden shadow-lg rounded-lg">
							<div className="px-6 py-4 border-b border-gray-200">
								<h3 className="text-lg font-medium text-gray-900 flex items-center">
									<FiUser className="w-5 h-5 mr-2" />
									Profile Information
								</h3>
							</div>
							<div className="px-6 py-4">
								<div className="flex items-center space-x-4 mb-4">
									{user?.profilePic ? (
										<img
											src={`${API_URL}${user.profilePic}`}
											alt="Profile"
											className="h-16 w-16 rounded-full object-cover"
										/>
									) : (
										<div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
											<FiUser className="w-8 h-8 text-gray-600" />
										</div>
									)}
									<div>
										<h4 className="text-lg font-semibold text-gray-900">
											{user?.name}
										</h4>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												user?.role === "admin"
													? "bg-red-100 text-red-800"
													: user?.role === "trainer"
													? "bg-blue-100 text-blue-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{user?.role}
										</span>
									</div>
								</div>

								<dl className="space-y-3">
									<div className="flex items-center">
										<dt className="flex items-center text-sm font-medium text-gray-500 w-20">
											Email
										</dt>
										<dd className="text-sm text-gray-900 ml-4">
											{user?.email}
										</dd>
									</div>
									<div className="flex items-center">
										<dt className="flex items-center text-sm font-medium text-gray-500 w-20">
											<FiCalendar className="w-4 h-4 mr-1" />
											Joined
										</dt>
										<dd className="text-sm text-gray-900 ml-4">
											{user?.createdAt
												? new Date(
														user.createdAt
												  ).toLocaleDateString()
												: "N/A"}
										</dd>
									</div>
								</dl>
							</div>
						</div>

						{/* Training Sessions Quick Actions for Members */}
						{user?.role === "member" && (
							<div className="bg-white overflow-hidden shadow-lg rounded-lg mt-6">
								<div className="px-6 py-4 border-b border-gray-200">
									<h3 className="text-lg font-medium text-gray-900 flex items-center">
										<FiUsers className="w-5 h-5 mr-2" />
										Training Sessions
									</h3>
								</div>
								<div className="p-6 space-y-3">
									<button
										onClick={handleTrainerNavigation}
										className="w-full p-3 text-left rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
									>
										<div className="flex items-center">
											<FiPlus className="w-5 h-5 text-blue-600 mr-3" />
											<div>
												<h4 className="font-medium text-blue-900">
													Book Training Session
												</h4>
												<p className="text-sm text-blue-700">
													Browse trainers and book
													your next session
												</p>
											</div>
										</div>
									</button>

									<button
										onClick={handleBookingsNavigation}
										className="w-full p-3 text-left rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors duration-200"
									>
										<div className="flex items-center">
											<FiClock className="w-5 h-5 text-green-600 mr-3" />
											<div>
												<h4 className="font-medium text-green-900">
													My Bookings
												</h4>
												<p className="text-sm text-green-700">
													View and manage your
													scheduled sessions
												</p>
											</div>
										</div>
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Main Content - Only show subscriptions for members */}
					{user?.role === "member" && (
						<div className="lg:col-span-2">
							<UserSubscriptions />
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
