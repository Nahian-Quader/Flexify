import { useEffect } from "react";
import {
	FiCalendar,
	FiClock,
	FiUser,
	FiCheck,
	FiX,
	FiClock as FiClockScheduled,
} from "react-icons/fi";
import { useScheduleStore } from "../store/scheduleStore";
import toast from "react-hot-toast";

const TrainerBookings = () => {
	const {
		trainerBookings,
		loading,
		error,
		fetchTrainerBookings,
		clearError,
	} = useScheduleStore();

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	useEffect(() => {
		fetchTrainerBookings();
	}, [fetchTrainerBookings]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

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
				return <FiClockScheduled className="w-5 h-5 text-blue-600" />;
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

	const upcomingBookings = trainerBookings.filter((booking) => {
		const bookingDate = new Date(booking.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return bookingDate >= today && booking.status === "booked";
	});

	const pastBookings = trainerBookings.filter((booking) => {
		const bookingDate = new Date(booking.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return bookingDate < today || booking.status !== "booked";
	});

	const todayBookings = upcomingBookings.filter((booking) => {
		const bookingDate = new Date(booking.date);
		const today = new Date();
		return bookingDate.toDateString() === today.toDateString();
	});

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 flex items-center">
					<FiCalendar className="w-6 h-6 mr-3 text-blue-600" />
					My Training Sessions
				</h2>
				<p className="text-gray-600 mt-1">
					Manage your scheduled training sessions with members
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-blue-50 rounded-lg p-4">
					<div className="flex items-center">
						<FiClock className="w-8 h-8 text-blue-600 mr-3" />
						<div>
							<p className="text-2xl font-bold text-blue-900">
								{todayBookings.length}
							</p>
							<p className="text-blue-700">Today's Sessions</p>
						</div>
					</div>
				</div>

				<div className="bg-green-50 rounded-lg p-4">
					<div className="flex items-center">
						<FiCalendar className="w-8 h-8 text-green-600 mr-3" />
						<div>
							<p className="text-2xl font-bold text-green-900">
								{upcomingBookings.length}
							</p>
							<p className="text-green-700">Upcoming Sessions</p>
						</div>
					</div>
				</div>

				<div className="bg-purple-50 rounded-lg p-4">
					<div className="flex items-center">
						<FiCheck className="w-8 h-8 text-purple-600 mr-3" />
						<div>
							<p className="text-2xl font-bold text-purple-900">
								{trainerBookings.length}
							</p>
							<p className="text-purple-700">Total Sessions</p>
						</div>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">
							Loading your sessions...
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-6">
					{todayBookings.length > 0 && (
						<div className="bg-white rounded-lg shadow-md">
							<div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
								<h3 className="text-lg font-semibold text-blue-900 flex items-center">
									<FiClock className="w-5 h-5 mr-2" />
									Today's Sessions
								</h3>
							</div>
							<div className="divide-y divide-gray-200">
								{todayBookings.map((booking) => (
									<div key={booking._id} className="p-6">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{booking.member.profilePic ? (
													<img
														src={`${API_URL}${booking.member.profilePic}`}
														alt={
															booking.member.name
														}
														className="h-12 w-12 rounded-full object-cover"
													/>
												) : (
													<div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
														<FiUser className="w-6 h-6 text-gray-600" />
													</div>
												)}
												<div>
													<h4 className="text-lg font-medium text-gray-900">
														{booking.member.name}
													</h4>
													<p className="text-gray-600">
														{booking.member.email}
													</p>
												</div>
											</div>
											<div className="text-right">
												<div className="flex items-center text-lg font-semibold text-blue-900">
													<FiClock className="w-5 h-5 mr-2" />
													{formatTime(
														booking.slot.start
													)}{" "}
													-{" "}
													{formatTime(
														booking.slot.end
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
														{booking.status}
													</span>
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{upcomingBookings.length > 0 && (
						<div className="bg-white rounded-lg shadow-md">
							<div className="px-6 py-4 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center">
									<FiCalendar className="w-5 h-5 mr-2" />
									Upcoming Sessions
								</h3>
							</div>
							<div className="divide-y divide-gray-200">
								{upcomingBookings.map((booking) => (
									<div key={booking._id} className="p-6">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{booking.member.profilePic ? (
													<img
														src={`${API_URL}${booking.member.profilePic}`}
														alt={
															booking.member.name
														}
														className="h-12 w-12 rounded-full object-cover"
													/>
												) : (
													<div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
														<FiUser className="w-6 h-6 text-gray-600" />
													</div>
												)}
												<div>
													<h4 className="text-lg font-medium text-gray-900">
														{booking.member.name}
													</h4>
													<p className="text-gray-600">
														{booking.member.email}
													</p>
													<p className="text-sm text-gray-500">
														{formatDate(
															booking.date
														)}
													</p>
												</div>
											</div>
											<div className="text-right">
												<div className="flex items-center text-lg font-semibold text-gray-900">
													<FiClock className="w-5 h-5 mr-2" />
													{formatTime(
														booking.slot.start
													)}{" "}
													-{" "}
													{formatTime(
														booking.slot.end
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
														{booking.status}
													</span>
												</span>
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
								<h3 className="text-lg font-semibold text-gray-900 flex items-center">
									<FiCheck className="w-5 h-5 mr-2" />
									Past Sessions
								</h3>
							</div>
							<div className="divide-y divide-gray-200">
								{pastBookings.slice(0, 10).map((booking) => (
									<div key={booking._id} className="p-6">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{booking.member.profilePic ? (
													<img
														src={`${API_URL}${booking.member.profilePic}`}
														alt={
															booking.member.name
														}
														className="h-10 w-10 rounded-full object-cover"
													/>
												) : (
													<div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
														<FiUser className="w-5 h-5 text-gray-600" />
													</div>
												)}
												<div>
													<h4 className="text-base font-medium text-gray-900">
														{booking.member.name}
													</h4>
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
														booking.slot.start
													)}{" "}
													-{" "}
													{formatTime(
														booking.slot.end
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
														{booking.status}
													</span>
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{trainerBookings.length === 0 && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="text-center text-gray-500">
								<FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
								<p>No training sessions scheduled yet</p>
								<p className="text-sm">
									Members will be able to book sessions once
									you set your availability
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default TrainerBookings;
