import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	FiCalendar,
	FiClock,
	FiUser,
	FiX,
	FiCheck,
	FiPlus,
} from "react-icons/fi";
import { useScheduleStore } from "../store/scheduleStore";
import { useAuthStore } from "../store/authStore";
import SubscriptionGuard from "../components/SubscriptionGuard";
import toast from "react-hot-toast";

const MyBookings = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const {
		myBookings,
		loading,
		error,
		fetchMyBookings,
		cancelBooking,
		clearError,
	} = useScheduleStore();

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	useEffect(() => {
		if (user?.role !== "member") {
			toast.error("Only members can view bookings");
			navigate("/dashboard");
			return;
		}

		fetchMyBookings();
	}, [user, navigate, fetchMyBookings]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const handleCancelBooking = async (bookingId: string) => {
		if (
			window.confirm(
				"Are you sure you want to cancel this booking? This action cannot be undone."
			)
		) {
			try {
				await cancelBooking(bookingId);
				toast.success("Booking cancelled successfully");
			} catch (error) {
				console.error("Cancel booking error:", error);
			}
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (time: string) => {
		const [hours, minutes] = time.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "booked":
				return <FiClock className="w-5 h-5 text-blue-600" />;
			case "completed":
				return <FiCheck className="w-5 h-5 text-green-600" />;
			case "cancelled":
				return <FiX className="w-5 h-5 text-red-600" />;
			default:
				return <FiClock className="w-5 h-5 text-gray-600" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "booked":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const canCancelBooking = (booking: any) => {
		if (booking.status !== "booked") return false;

		const bookingDate = new Date(booking.date);
		const currentDate = new Date();
		const timeDiff = bookingDate.getTime() - currentDate.getTime();
		const hoursDiff = timeDiff / (1000 * 3600);

		return hoursDiff >= 24;
	};

	const upcomingBookings = myBookings.filter((booking) => {
		const bookingDate = new Date(booking.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return bookingDate >= today && booking.status === "booked";
	});

	const pastBookings = myBookings.filter((booking) => {
		const bookingDate = new Date(booking.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return bookingDate < today || booking.status !== "booked";
	});

	return (
		<SubscriptionGuard>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center">
								<FiCalendar className="w-8 h-8 mr-3 text-blue-600" />
								My Training Sessions
							</h1>
							<p className="text-gray-600 mt-2">
								Manage your scheduled training sessions
							</p>
						</div>

						<button
							onClick={() => navigate("/trainers")}
							className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
						>
							<FiPlus className="w-4 h-4 mr-2" />
							Book New Session
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-blue-50 rounded-lg p-4">
							<div className="flex items-center">
								<FiClock className="w-8 h-8 text-blue-600 mr-3" />
								<div>
									<p className="text-2xl font-bold text-blue-900">
										{upcomingBookings.length}
									</p>
									<p className="text-blue-700">
										Upcoming Sessions
									</p>
								</div>
							</div>
						</div>

						<div className="bg-green-50 rounded-lg p-4">
							<div className="flex items-center">
								<FiCheck className="w-8 h-8 text-green-600 mr-3" />
								<div>
									<p className="text-2xl font-bold text-green-900">
										{
											myBookings.filter(
												(b) => b.status === "completed"
											).length
										}
									</p>
									<p className="text-green-700">
										Completed Sessions
									</p>
								</div>
							</div>
						</div>

						<div className="bg-purple-50 rounded-lg p-4">
							<div className="flex items-center">
								<FiCalendar className="w-8 h-8 text-purple-600 mr-3" />
								<div>
									<p className="text-2xl font-bold text-purple-900">
										{myBookings.length}
									</p>
									<p className="text-purple-700">
										Total Sessions
									</p>
								</div>
							</div>
						</div>
					</div>

					{loading ? (
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="text-center">
								<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								<p className="mt-2 text-gray-600">
									Loading your bookings...
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							{upcomingBookings.length > 0 && (
								<div className="bg-white rounded-lg shadow-md">
									<div className="px-6 py-4 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<FiClock className="w-5 h-5 mr-2" />
											Upcoming Sessions
										</h2>
									</div>
									<div className="divide-y divide-gray-200">
										{upcomingBookings.map((booking) => (
											<div
												key={booking._id}
												className="p-6"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-4">
														{booking.trainer
															.profilePic ? (
															<img
																src={`${API_URL}${booking.trainer.profilePic}`}
																alt={
																	booking
																		.trainer
																		.name
																}
																className="h-12 w-12 rounded-full object-cover"
															/>
														) : (
															<div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
																<FiUser className="w-6 h-6 text-gray-600" />
															</div>
														)}
														<div>
															<h3 className="text-lg font-medium text-gray-900">
																{
																	booking
																		.trainer
																		.name
																}
															</h3>
															<p className="text-gray-600">
																{
																	booking
																		.trainer
																		.email
																}
															</p>
															<p className="text-sm text-gray-500">
																{formatDate(
																	booking.date
																)}
															</p>
														</div>
													</div>
													<div className="flex items-center space-x-4">
														<div className="text-right">
															<div className="flex items-center text-lg font-semibold text-gray-900">
																<FiClock className="w-5 h-5 mr-2" />
																{formatTime(
																	booking.slot
																		.start
																)}{" "}
																-{" "}
																{formatTime(
																	booking.slot
																		.end
																)}
															</div>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
																	booking.status
																)}`}
															>
																{getStatusIcon(
																	booking.status
																)}
																<span className="ml-1 capitalize">
																	{
																		booking.status
																	}
																</span>
															</span>
														</div>
														{canCancelBooking(
															booking
														) && (
															<button
																onClick={() =>
																	handleCancelBooking(
																		booking._id
																	)
																}
																className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
																title="Cancel booking"
															>
																<FiX className="w-5 h-5" />
															</button>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{pastBookings.length > 0 && (
								<div className="bg-white rounded-lg shadow-md">
									<div className="px-6 py-4 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<FiCheck className="w-5 h-5 mr-2" />
											Past Sessions
										</h2>
									</div>
									<div className="divide-y divide-gray-200">
										{pastBookings
											.slice(0, 10)
											.map((booking) => (
												<div
													key={booking._id}
													className="p-6"
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-4">
															{booking.trainer
																.profilePic ? (
																<img
																	src={`${API_URL}${booking.trainer.profilePic}`}
																	alt={
																		booking
																			.trainer
																			.name
																	}
																	className="h-10 w-10 rounded-full object-cover"
																/>
															) : (
																<div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
																	<FiUser className="w-5 h-5 text-gray-600" />
																</div>
															)}
															<div>
																<h3 className="text-base font-medium text-gray-900">
																	{
																		booking
																			.trainer
																			.name
																	}
																</h3>
																<p className="text-sm text-gray-500">
																	{formatDate(
																		booking.date
																	)}
																</p>
															</div>
														</div>
														<div className="text-right">
															<div className="flex items-center text-sm text-gray-600">
																<FiClock className="w-4 h-4 mr-1" />
																{formatTime(
																	booking.slot
																		.start
																)}{" "}
																-{" "}
																{formatTime(
																	booking.slot
																		.end
																)}
															</div>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
																	booking.status
																)}`}
															>
																{getStatusIcon(
																	booking.status
																)}
																<span className="ml-1 capitalize">
																	{
																		booking.status
																	}
																</span>
															</span>
														</div>
													</div>
												</div>
											))}
									</div>
								</div>
							)}

							{myBookings.length === 0 && (
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="text-center text-gray-500">
										<FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
										<p>No training sessions booked yet</p>
										<p className="text-sm mb-4">
											Start your fitness journey by
											booking your first session
										</p>
										<button
											onClick={() =>
												navigate("/trainers")
											}
											className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
										>
											<FiPlus className="w-4 h-4 mr-2" />
											Book Your First Session
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</SubscriptionGuard>
	);
};

export default MyBookings;
