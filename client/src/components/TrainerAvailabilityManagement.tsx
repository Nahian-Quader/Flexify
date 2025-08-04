import React, { useState, useEffect } from "react";
import {
	FiCalendar,
	FiClock,
	FiPlus,
	FiEdit,
	FiTrash2,
	FiSave,
	FiX,
} from "react-icons/fi";
import { useScheduleStore, type TimeSlot } from "../store/scheduleStore";
import toast from "react-hot-toast";

const TrainerAvailabilityManagement = () => {
	const {
		myAvailability,
		loading,
		error,
		fetchMyAvailability,
		createAvailability,
		updateAvailability,
		deleteAvailability,
		clearError,
	} = useScheduleStore();

	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		date: "",
		slots: [{ start: "", end: "" }],
	});

	useEffect(() => {
		fetchMyAvailability();
	}, [fetchMyAvailability]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const handleAddSlot = () => {
		setFormData((prev) => ({
			...prev,
			slots: [...prev.slots, { start: "", end: "" }],
		}));
	};

	const handleRemoveSlot = (index: number) => {
		if (formData.slots.length > 1) {
			setFormData((prev) => ({
				...prev,
				slots: prev.slots.filter((_, i) => i !== index),
			}));
		}
	};

	const handleSlotChange = (
		index: number,
		field: "start" | "end",
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			slots: prev.slots.map((slot, i) =>
				i === index ? { ...slot, [field]: value } : slot
			),
		}));
	};

	const validateSlots = (slots: TimeSlot[]) => {
		for (const slot of slots) {
			if (!slot.start || !slot.end) {
				toast.error("All time slots must have start and end times");
				return false;
			}

			if (slot.start >= slot.end) {
				toast.error("End time must be after start time");
				return false;
			}
		}

		for (let i = 0; i < slots.length; i++) {
			for (let j = i + 1; j < slots.length; j++) {
				const slot1 = slots[i];
				const slot2 = slots[j];

				if (
					(slot1.start < slot2.end && slot1.end > slot2.start) ||
					(slot2.start < slot1.end && slot2.end > slot1.start)
				) {
					toast.error("Time slots cannot overlap");
					return false;
				}
			}
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.date) {
			toast.error("Date is required");
			return;
		}

		if (!validateSlots(formData.slots)) {
			return;
		}

		try {
			if (editingId) {
				await updateAvailability(editingId, formData.slots);
				toast.success("Availability updated successfully");
				setEditingId(null);
			} else {
				await createAvailability(formData.date, formData.slots);
				toast.success("Availability created successfully");
				setShowAddForm(false);
			}

			setFormData({ date: "", slots: [{ start: "", end: "" }] });
		} catch (error) {
			console.error("Submit error:", error);
		}
	};

	const handleEdit = (availability: any) => {
		setEditingId(availability._id);
		setFormData({
			date: availability.date.split("T")[0],
			slots: availability.slots,
		});
		setShowAddForm(true);
	};

	const handleDelete = async (id: string) => {
		if (
			window.confirm("Are you sure you want to delete this availability?")
		) {
			try {
				await deleteAvailability(id);
				toast.success("Availability deleted successfully");
			} catch (error) {
				console.error("Delete error:", error);
			}
		}
	};

	const cancelEdit = () => {
		setEditingId(null);
		setShowAddForm(false);
		setFormData({ date: "", slots: [{ start: "", end: "" }] });
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

	const getTomorrowDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 flex items-center">
						<FiCalendar className="w-6 h-6 mr-3 text-blue-600" />
						My Availability
					</h2>
					<p className="text-gray-600 mt-1">
						Manage your training schedule and available time slots
					</p>
				</div>

				{!showAddForm && (
					<button
						onClick={() => setShowAddForm(true)}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
					>
						<FiPlus className="w-4 h-4 mr-2" />
						Add Availability
					</button>
				)}
			</div>

			{showAddForm && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							{editingId
								? "Edit Availability"
								: "Add New Availability"}
						</h3>
						<button
							title="Cancel editing"
							onClick={cancelEdit}
							className="text-gray-400 hover:text-gray-600"
						>
							<FiX className="w-5 h-5" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="date"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Date
							</label>
							<input
								type="date"
								id="date"
								value={formData.date}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										date: e.target.value,
									}))
								}
								min={getTomorrowDate()}
								disabled={editingId !== null}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
								required
							/>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-sm font-medium text-gray-700">
									Time Slots
								</label>
								<button
									type="button"
									onClick={handleAddSlot}
									className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
									aria-label="Add time slot"
								>
									<FiPlus className="w-4 h-4 mr-1" />
									Add Slot
								</button>
							</div>

							<div className="space-y-3">
								{formData.slots.map((slot, index) => (
									<div
										key={index}
										className="flex items-center space-x-3"
									>
										<div className="flex-1">
											<label
												htmlFor={`start-${index}`}
												className="sr-only"
											>
												Start time
											</label>
											<input
												id={`start-${index}`}
												type="time"
												value={slot.start}
												onChange={(e) =>
													handleSlotChange(
														index,
														"start",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												required
											/>
										</div>
										<span className="text-gray-500">
											to
										</span>
										<div className="flex-1">
											<label
												htmlFor={`end-${index}`}
												className="sr-only"
											>
												End time
											</label>
											<input
												id={`end-${index}`}
												type="time"
												value={slot.end}
												onChange={(e) =>
													handleSlotChange(
														index,
														"end",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												required
											/>
										</div>
										{formData.slots.length > 1 && (
											<button
												type="button"
												onClick={() =>
													handleRemoveSlot(index)
												}
												className="text-red-600 hover:text-red-700"
												aria-label="Remove time slot"
											>
												<FiTrash2 className="w-4 h-4" />
											</button>
										)}
									</div>
								))}
							</div>
						</div>

						<div className="flex space-x-3 pt-4">
							<button
								type="submit"
								disabled={loading}
								className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
							>
								<FiSave className="w-4 h-4 mr-2" />
								{loading
									? "Saving..."
									: editingId
									? "Update"
									: "Create"}
							</button>
							<button
								type="button"
								onClick={cancelEdit}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="bg-white rounded-lg shadow-md">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">
						Current Availability
					</h3>
				</div>

				{loading && !showAddForm ? (
					<div className="p-6 text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">
							Loading availability...
						</p>
					</div>
				) : myAvailability.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
						<p>No availability scheduled yet</p>
						<p className="text-sm">
							Add your first availability to start accepting
							bookings
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{myAvailability.map((availability) => (
							<div key={availability._id} className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center mb-2">
											<FiCalendar className="w-5 h-5 text-blue-600 mr-2" />
											<h4 className="text-lg font-medium text-gray-900">
												{formatDate(availability.date)}
											</h4>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{availability.slots.map(
												(slot, index) => (
													<div
														key={index}
														className="flex items-center p-3 bg-blue-50 rounded-lg"
													>
														<FiClock className="w-4 h-4 text-blue-600 mr-2" />
														<span className="text-sm font-medium text-blue-900">
															{formatTime(
																slot.start
															)}{" "}
															-{" "}
															{formatTime(
																slot.end
															)}
														</span>
													</div>
												)
											)}
										</div>
									</div>

									<div className="flex space-x-2 ml-4">
										<button
											onClick={() =>
												handleEdit(availability)
											}
											className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
											title="Edit availability"
										>
											<FiEdit className="w-4 h-4" />
										</button>
										<button
											onClick={() =>
												handleDelete(availability._id)
											}
											className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
											title="Delete availability"
										>
											<FiTrash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default TrainerAvailabilityManagement;
