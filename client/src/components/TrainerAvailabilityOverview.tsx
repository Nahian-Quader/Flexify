import { useState, useEffect } from "react";
import {
	FiCalendar,
	FiClock,
	FiUser,
	FiFilter,
	FiBookOpen,
} from "react-icons/fi";
import { useScheduleStore } from "../store/scheduleStore";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";
import toast from "react-hot-toast";

const TrainerAvailabilityOverview = () => {
	const { user } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const {
		trainers,
		trainerAvailability,
		loading,
		error,
		fetchTrainers,
		clearError,
	} = useScheduleStore();

	const [selectedDate, setSelectedDate] = useState("");
	const [selectedTrainer, setSelectedTrainer] = useState("");

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	useEffect(() => {
		fetchTrainers();
		if (user?.role === "member") {
			fetchUserSubscriptions();
		}
	}, [fetchTrainers, fetchUserSubscriptions, user]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const handleSlotClick = (availability: any, slot: any) => {
		if (
			user?.role === "member" &&
			!hasActiveSubscription(userSubscriptions)
		) {
			toast.error(
				"You need an active subscription to book training sessions"
			);
			return;
		}

		window.location.href = `/book-session?trainer=${availability.trainer._id}&date=${availability.date}&start=${slot.start}&end=${slot.end}`;
	};

	const isSlotBooked = (availability: any, slot: any) => {
		return (
			availability.availableSlots !== undefined &&
			!availability.availableSlots.some(
				(availSlot: any) =>
					availSlot.start === slot.start && availSlot.end === slot.end
			)
		);
	};

	const canBookSlot = () => {
		return (
			user?.role === "trainer" ||
			(user?.role === "member" &&
				hasActiveSubscription(userSubscriptions))
		);
	};

	const handleDateFilter = (date: string) => {
		setSelectedDate(date);
		fetchTrainers(date);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
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

	const getNext7Days = () => {
		const dates = [];
		for (let i = 1; i <= 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() + i);
			dates.push({
				value: date.toISOString().split("T")[0],
				label: date.toLocaleDateString("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric",
				}),
			});
		}
		return dates;
	};

	const filteredAvailability = selectedTrainer
		? trainerAvailability.filter(
				(avail) => avail.trainer._id === selectedTrainer
		  )
		: trainerAvailability;

	const availableTrainerIds = new Set(
		trainerAvailability.map((avail) => avail.trainer._id)
	);
	const trainersWithAvailability = trainers.filter((trainer) =>
		availableTrainerIds.has(trainer._id)
	);

	return (
		<div className="space-y-6">
			{user?.role === "member" &&
				userSubscriptions.length > 0 &&
				!hasActiveSubscription(userSubscriptions) && (
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div className="flex items-center">
							<FiUser className="w-5 h-5 text-yellow-600 mr-3" />
							<div>
								<h3 className="text-sm font-medium text-yellow-800">
									Subscription Required
								</h3>
								<p className="text-sm text-yellow-700 mt-1">
									You need an active subscription to book
									training sessions. View our membership plans
									to get started.
								</p>
							</div>
						</div>
					</div>
				)}
			<div>
				<h2 className="text-2xl font-bold text-gray-900 flex items-center">
					<FiCalendar className="w-6 h-6 mr-3 text-blue-600" />
					Trainer Availability
				</h2>
				<p className="text-gray-600 mt-1">
					Browse available training sessions and book with your
					preferred trainer
				</p>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<FiFilter className="w-4 h-4 text-gray-500" />
							<span className="text-sm font-medium text-gray-700">
								Filters:
							</span>
						</div>

						<div className="flex items-center space-x-2">
							<label
								htmlFor="date-filter"
								className="text-sm text-gray-600"
							>
								Date:
							</label>
							<select
								id="date-filter"
								value={selectedDate}
								onChange={(e) =>
									handleDateFilter(e.target.value)
								}
								className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">All upcoming dates</option>
								{getNext7Days().map((date) => (
									<option key={date.value} value={date.value}>
										{date.label}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-center space-x-2">
							<label
								htmlFor="trainer-filter"
								className="text-sm text-gray-600"
							>
								Trainer:
							</label>
							<select
								id="trainer-filter"
								value={selectedTrainer}
								onChange={(e) =>
									setSelectedTrainer(e.target.value)
								}
								className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">All trainers</option>
								{trainersWithAvailability.map((trainer) => (
									<option
										key={trainer._id}
										value={trainer._id}
									>
										{trainer.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<button
						onClick={() => {
							setSelectedDate("");
							setSelectedTrainer("");
							fetchTrainers();
						}}
						className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
					>
						Clear Filters
					</button>
				</div>
			</div>

			{loading ? (
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">
							Loading trainer availability...
						</p>
					</div>
				</div>
			) : filteredAvailability.length === 0 ? (
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="text-center text-gray-500">
						<FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
						<p>No availability found</p>
						<p className="text-sm">
							{selectedDate || selectedTrainer
								? "Try adjusting your filters to see more options"
								: "No trainers have set their availability yet"}
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{filteredAvailability.map((availability) => (
						<div
							key={availability._id}
							className="bg-white rounded-lg shadow-md overflow-hidden"
						>
							<div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
								<div className="flex items-center space-x-3">
									{availability.trainer.profilePic ? (
										<img
											src={`${API_URL}${availability.trainer.profilePic}`}
											alt={availability.trainer.name}
											className="h-12 w-12 rounded-full object-cover"
										/>
									) : (
										<div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
											<FiUser className="w-6 h-6 text-gray-600" />
										</div>
									)}
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											{availability.trainer.name}
										</h3>
										<p className="text-sm text-gray-600">
											{availability.trainer.email}
										</p>
									</div>
								</div>
							</div>

							<div className="p-6">
								<div className="flex items-center mb-4">
									<FiCalendar className="w-5 h-5 text-blue-600 mr-2" />
									<span className="text-lg font-medium text-gray-900">
										{formatDate(availability.date)}
									</span>
								</div>

								<div className="space-y-2">
									<h4 className="text-sm font-medium text-gray-700 mb-3">
										Available Time Slots:
									</h4>

									{availability.availableSlots &&
									availability.availableSlots.length > 0 ? (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											{availability.availableSlots.map(
												(slot, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
													>
														<div className="flex items-center">
															<FiClock className="w-4 h-4 text-green-600 mr-2" />
															<span className="text-sm font-medium text-green-900">
																{formatTime(
																	slot.start
																)}{" "}
																-{" "}
																{formatTime(
																	slot.end
																)}
															</span>
														</div>
														<button
															onClick={() =>
																handleSlotClick(
																	availability,
																	slot
																)
															}
															className="p-1 text-green-600 hover:text-green-700"
															title="Book this slot"
															disabled={
																!canBookSlot()
															}
														>
															<FiBookOpen className="w-4 h-4" />
														</button>
													</div>
												)
											)}
										</div>
									) : availability.slots &&
									  availability.slots.length > 0 ? (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											{availability.slots.map(
												(slot, index) => {
													const isBooked =
														isSlotBooked(
															availability,
															slot
														);

													return (
														<div
															key={index}
															className={`flex items-center justify-between p-3 border rounded-lg transition-colors duration-200 ${
																isBooked
																	? "bg-red-50 border-red-200 opacity-75 cursor-not-allowed"
																	: "bg-green-50 border-green-200 hover:bg-green-100"
															}`}
														>
															<div className="flex items-center">
																<FiClock
																	className={`w-4 h-4 mr-2 ${
																		isBooked
																			? "text-red-600"
																			: "text-green-600"
																	}`}
																/>
																<span
																	className={`text-sm font-medium ${
																		isBooked
																			? "text-red-900"
																			: "text-green-900"
																	}`}
																>
																	{formatTime(
																		slot.start
																	)}{" "}
																	-{" "}
																	{formatTime(
																		slot.end
																	)}
																</span>
																{isBooked && (
																	<span className="ml-2 text-xs text-red-600 font-medium">
																		BOOKED
																	</span>
																)}
															</div>
															{!isBooked &&
																canBookSlot() && (
																	<button
																		onClick={() =>
																			handleSlotClick(
																				availability,
																				slot
																			)
																		}
																		className="p-1 text-green-600 hover:text-green-700"
																		title="Book this slot"
																	>
																		<FiBookOpen className="w-4 h-4" />
																	</button>
																)}
														</div>
													);
												}
											)}
										</div>
									) : (
										<p className="text-gray-500 text-sm">
											No slots available
										</p>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default TrainerAvailabilityOverview;
