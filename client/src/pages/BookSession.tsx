import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiClock, FiUser, FiBookOpen, FiArrowLeft } from "react-icons/fi";
import { useScheduleStore } from "../store/scheduleStore";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";
import SubscriptionGuard from "../components/SubscriptionGuard";
import toast from "react-hot-toast";

const BookSession = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { user } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();

	const {
		trainers,
		trainerAvailability,
		loading,
		error,
		fetchTrainers,
		bookSession,
		clearError,
	} = useScheduleStore();

	const [selectedTrainer, setSelectedTrainer] = useState("");
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedSlot, setSelectedSlot] = useState<{
		start: string;
		end: string;
	} | null>(null);
	const [availableSlots, setAvailableSlots] = useState<
		{ start: string; end: string }[]
	>([]);

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	useEffect(() => {
		if (user?.role !== "member") {
			toast.error("Only members can book training sessions");
			navigate("/dashboard");
			return;
		}

		fetchUserSubscriptions();

		const trainer = searchParams.get("trainer");
		const date = searchParams.get("date");
		const start = searchParams.get("start");
		const end = searchParams.get("end");

		fetchTrainers();

		if (trainer && date && start && end) {
			setSelectedTrainer(trainer);

			const formattedDate = new Date(date).toISOString().split("T")[0];
			setSelectedDate(formattedDate);
			setSelectedSlot({ start, end });
		}
	}, [user, navigate, searchParams, fetchTrainers, fetchUserSubscriptions]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	useEffect(() => {
		if (selectedTrainer && selectedDate) {
			const availability = trainerAvailability.find(
				(avail) =>
					avail.trainer._id === selectedTrainer &&
					avail.date.split("T")[0] === selectedDate
			);

			if (availability) {
				const slots = availability.availableSlots || availability.slots;
				setAvailableSlots(slots);
			} else {
				setAvailableSlots([]);
				fetchTrainers(selectedDate);
			}
		}
	}, [selectedTrainer, selectedDate, trainerAvailability, fetchTrainers]);

	const handleBooking = async () => {
		if (!selectedTrainer || !selectedDate || !selectedSlot) {
			toast.error("Please select a trainer, date, and time slot");
			return;
		}

		if (!hasActiveSubscription(userSubscriptions)) {
			toast.error(
				"You need an active subscription to book training sessions"
			);
			navigate("/membership-plans");
			return;
		}

		try {
			await bookSession(selectedTrainer, selectedDate, selectedSlot);
			toast.success("Session booked successfully!");
			navigate("/dashboard");
		} catch (error) {
			console.error("Booking error:", error);
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

	const getNext30Days = () => {
		const dates = [];
		for (let i = 1; i <= 30; i++) {
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

	const selectedTrainerData = trainers.find(
		(trainer) => trainer._id === selectedTrainer
	);

	return (
		<SubscriptionGuard>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-6">
						<button
							onClick={() => navigate(-1)}
							className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
						>
							<FiArrowLeft className="w-4 h-4 mr-2" />
							Back
						</button>

						<h1 className="text-3xl font-bold text-gray-900 flex items-center">
							<FiBookOpen className="w-8 h-8 mr-3 text-blue-600" />
							Book Training Session
						</h1>
						<p className="text-gray-600 mt-2">
							Choose your trainer, date, and time slot
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-6">
							<div className="bg-white rounded-lg shadow-md p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">
									Select Trainer
								</h2>
								<div className="space-y-3">
									{trainers.map((trainer) => (
										<div
											key={trainer._id}
											onClick={() =>
												setSelectedTrainer(trainer._id)
											}
											className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
												selectedTrainer === trainer._id
													? "border-blue-500 bg-blue-50"
													: "border-gray-200 hover:border-gray-300"
											}`}
										>
											<div className="flex items-center space-x-3">
												{trainer.profilePic ? (
													<img
														src={`${API_URL}${trainer.profilePic}`}
														alt={trainer.name}
														className="h-12 w-12 rounded-full object-cover"
													/>
												) : (
													<div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
														<FiUser className="w-6 h-6 text-gray-600" />
													</div>
												)}
												<div>
													<h3 className="text-lg font-medium text-gray-900">
														{trainer.name}
													</h3>
													<p className="text-gray-600">
														{trainer.email}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="bg-white rounded-lg shadow-md p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">
									Select Date
								</h2>
								<select
									value={selectedDate}
									onChange={(e) =>
										setSelectedDate(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={!selectedTrainer}
									title="Select a date for your training session"
								>
									<option value="">Choose a date</option>
									{getNext30Days().map((date) => (
										<option
											key={date.value}
											value={date.value}
										>
											{date.label}
										</option>
									))}
								</select>
							</div>

							<div className="bg-white rounded-lg shadow-md p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">
									Select Time Slot
								</h2>

								{!selectedTrainer || !selectedDate ? (
									<p className="text-gray-500">
										Please select a trainer and date first
									</p>
								) : loading ? (
									<div className="text-center py-4">
										<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
										<p className="mt-2 text-gray-600">
											Loading available slots...
										</p>
									</div>
								) : availableSlots.length === 0 ? (
									<p className="text-gray-500">
										No available slots for this date
									</p>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{availableSlots.map((slot, index) => (
											<div
												key={index}
												onClick={() =>
													setSelectedSlot(slot)
												}
												className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
													selectedSlot?.start ===
														slot.start &&
													selectedSlot?.end ===
														slot.end
														? "border-blue-500 bg-blue-50"
														: "border-gray-200 hover:border-gray-300"
												}`}
											>
												<div className="flex items-center">
													<FiClock className="w-4 h-4 text-gray-600 mr-2" />
													<span className="font-medium">
														{formatTime(slot.start)}{" "}
														- {formatTime(slot.end)}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="lg:col-span-1">
							<div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">
									Booking Summary
								</h2>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Trainer
										</label>
										<p className="mt-1 text-gray-900">
											{selectedTrainerData
												? selectedTrainerData.name
												: "Not selected"}
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700">
											Date
										</label>
										<p className="mt-1 text-gray-900">
											{selectedDate
												? formatDate(selectedDate)
												: "Not selected"}
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700">
											Time
										</label>
										<p className="mt-1 text-gray-900">
											{selectedSlot
												? `${formatTime(
														selectedSlot.start
												  )} - ${formatTime(
														selectedSlot.end
												  )}`
												: "Not selected"}
										</p>
									</div>
								</div>

								<button
									onClick={handleBooking}
									disabled={
										!selectedTrainer ||
										!selectedDate ||
										!selectedSlot ||
										loading
									}
									className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								>
									{loading ? "Booking..." : "Book Session"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</SubscriptionGuard>
	);
};

export default BookSession;
