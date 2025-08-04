import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import TrainerAvailability from "../models/TrainerAvailability";
import Booking from "../models/Booking";
import User from "../models/User";

export const getMyAvailability = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const trainerId = req.user?._id;

		const availability = await TrainerAvailability.find({
			trainer: trainerId,
		})
			.populate("trainer", "name email profilePic")
			.sort({ date: 1 });

		res.status(200).json({
			success: true,
			data: { availability },
		});
	} catch (error) {
		console.error("Get my availability error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching availability",
		});
	}
};

export const createAvailability = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const trainerId = req.user?._id;
		const { date, slots } = req.body;

		if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
			res.status(400).json({
				success: false,
				message: "Date and at least one time slot are required",
			});
			return;
		}

		const parsedDate = new Date(date);
		if (isNaN(parsedDate.getTime())) {
			res.status(400).json({
				success: false,
				message: "Invalid date format",
			});
			return;
		}

		if (parsedDate < new Date()) {
			res.status(400).json({
				success: false,
				message: "Cannot create availability for past dates",
			});
			return;
		}

		const existingAvailability = await TrainerAvailability.findOne({
			trainer: trainerId,
			date: parsedDate,
		});

		if (existingAvailability) {
			res.status(400).json({
				success: false,
				message: "Availability already exists for this date",
			});
			return;
		}

		const availability = new TrainerAvailability({
			trainer: trainerId,
			date: parsedDate,
			slots,
		});

		await availability.save();
		await availability.populate("trainer", "name email profilePic");

		res.status(201).json({
			success: true,
			message: "Availability created successfully",
			data: { availability },
		});
	} catch (error) {
		console.error("Create availability error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while creating availability",
		});
	}
};

export const updateAvailability = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const trainerId = req.user?._id;
		const { slots } = req.body;

		if (!slots || !Array.isArray(slots) || slots.length === 0) {
			res.status(400).json({
				success: false,
				message: "At least one time slot is required",
			});
			return;
		}

		const availability = await TrainerAvailability.findOne({
			_id: id,
			trainer: trainerId,
		});

		if (!availability) {
			res.status(404).json({
				success: false,
				message: "Availability not found",
			});
			return;
		}

		const existingBookings = await Booking.find({
			trainer: trainerId,
			date: availability.date,
			status: "booked",
		});

		for (const booking of existingBookings) {
			const slotExists = slots.some(
				(slot: any) =>
					slot.start === booking.slot.start &&
					slot.end === booking.slot.end
			);
			if (!slotExists) {
				res.status(400).json({
					success: false,
					message: "Cannot remove slots that have existing bookings",
				});
				return;
			}
		}

		availability.slots = slots;
		await availability.save();
		await availability.populate("trainer", "name email profilePic");

		res.status(200).json({
			success: true,
			message: "Availability updated successfully",
			data: { availability },
		});
	} catch (error) {
		console.error("Update availability error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating availability",
		});
	}
};

export const deleteAvailability = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const trainerId = req.user?._id;

		const availability = await TrainerAvailability.findOne({
			_id: id,
			trainer: trainerId,
		});

		if (!availability) {
			res.status(404).json({
				success: false,
				message: "Availability not found",
			});
			return;
		}

		const existingBookings = await Booking.find({
			trainer: trainerId,
			date: availability.date,
			status: "booked",
		});

		if (existingBookings.length > 0) {
			res.status(400).json({
				success: false,
				message: "Cannot delete availability with existing bookings",
			});
			return;
		}

		await TrainerAvailability.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Availability deleted successfully",
		});
	} catch (error) {
		console.error("Delete availability error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while deleting availability",
		});
	}
};

export const getAllTrainers = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { date } = req.query;

		const trainers = await User.find({ role: "trainer" }).select(
			"name email profilePic"
		);

		let availabilityData: any[] = [];

		if (date) {
			const parsedDate = new Date(date as string);
			if (!isNaN(parsedDate.getTime())) {
				const availability = await TrainerAvailability.find({
					date: parsedDate,
				}).populate("trainer", "name email profilePic");

				const bookings = await Booking.find({
					date: parsedDate,
					status: "booked",
				});

				availabilityData = availability.map((avail) => {
					const bookedSlots = bookings
						.filter(
							(booking) =>
								booking.trainer.toString() ===
								avail.trainer._id.toString()
						)
						.map((booking) => booking.slot);

					const availableSlots = avail.slots.filter(
						(slot) =>
							!bookedSlots.some(
								(booked) =>
									booked.start === slot.start &&
									booked.end === slot.end
							)
					);

					return {
						...avail.toObject(),
						availableSlots,
					};
				});
			}
		} else {
			const currentDate = new Date();
			const futureDate = new Date();
			futureDate.setDate(currentDate.getDate() + 30);

			const availability = await TrainerAvailability.find({
				date: { $gte: currentDate, $lte: futureDate },
			}).populate("trainer", "name email profilePic");

			const bookings = await Booking.find({
				date: { $gte: currentDate, $lte: futureDate },
				status: "booked",
			});

			availabilityData = availability.map((avail) => {
				const bookedSlots = bookings
					.filter(
						(booking) =>
							booking.trainer.toString() ===
								avail.trainer._id.toString() &&
							booking.date.toDateString() ===
								avail.date.toDateString()
					)
					.map((booking) => booking.slot);

				const availableSlots = avail.slots.filter(
					(slot) =>
						!bookedSlots.some(
							(booked) =>
								booked.start === slot.start &&
								booked.end === slot.end
						)
				);

				return {
					...avail.toObject(),
					availableSlots,
				};
			});
		}

		res.status(200).json({
			success: true,
			data: {
				trainers,
				availability: availabilityData,
			},
		});
	} catch (error) {
		console.error("Get all trainers error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching trainers",
		});
	}
};

export const bookSession = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const memberId = req.user?._id;
		const { trainerId, date, slot } = req.body;

		if (!trainerId || !date || !slot || !slot.start || !slot.end) {
			res.status(400).json({
				success: false,
				message: "Trainer ID, date, and time slot are required",
			});
			return;
		}

		const parsedDate = new Date(date);
		if (isNaN(parsedDate.getTime())) {
			res.status(400).json({
				success: false,
				message: "Invalid date format",
			});
			return;
		}

		if (parsedDate < new Date()) {
			res.status(400).json({
				success: false,
				message: "Cannot book sessions for past dates",
			});
			return;
		}

		const trainer = await User.findOne({ _id: trainerId, role: "trainer" });
		if (!trainer) {
			res.status(404).json({
				success: false,
				message: "Trainer not found",
			});
			return;
		}

		const availability = await TrainerAvailability.findOne({
			trainer: trainerId,
			date: parsedDate,
		});

		if (!availability) {
			res.status(404).json({
				success: false,
				message:
					"No availability found for this trainer on the selected date",
			});
			return;
		}

		const slotExists = availability.slots.some(
			(availableSlot) =>
				availableSlot.start === slot.start &&
				availableSlot.end === slot.end
		);

		if (!slotExists) {
			res.status(400).json({
				success: false,
				message: "Selected time slot is not available",
			});
			return;
		}

		const existingBooking = await Booking.findOne({
			trainer: trainerId,
			date: parsedDate,
			"slot.start": slot.start,
			"slot.end": slot.end,
			status: "booked",
		});

		if (existingBooking) {
			res.status(400).json({
				success: false,
				message: "This time slot is already booked",
			});
			return;
		}

		const memberDoubleBooking = await Booking.findOne({
			member: memberId,
			trainer: trainerId,
			date: parsedDate,
			"slot.start": slot.start,
			"slot.end": slot.end,
			status: "booked",
		});

		if (memberDoubleBooking) {
			res.status(400).json({
				success: false,
				message: "You have already booked this slot",
			});
			return;
		}

		const booking = new Booking({
			member: memberId,
			trainer: trainerId,
			date: parsedDate,
			slot,
		});

		await booking.save();
		await booking.populate([
			{ path: "member", select: "name email profilePic" },
			{ path: "trainer", select: "name email profilePic" },
		]);

		res.status(201).json({
			success: true,
			message: "Session booked successfully",
			data: { booking },
		});
	} catch (error) {
		console.error("Book session error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while booking session",
		});
	}
};

export const getMyBookings = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const memberId = req.user?._id;

		const bookings = await Booking.find({ member: memberId })
			.populate("trainer", "name email profilePic")
			.populate("member", "name email profilePic")
			.sort({ date: 1 });

		res.status(200).json({
			success: true,
			data: { bookings },
		});
	} catch (error) {
		console.error("Get my bookings error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching bookings",
		});
	}
};

export const cancelBooking = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const memberId = req.user?._id;

		const booking = await Booking.findOne({
			_id: id,
			member: memberId,
		});

		if (!booking) {
			res.status(404).json({
				success: false,
				message: "Booking not found",
			});
			return;
		}

		if (booking.status !== "booked") {
			res.status(400).json({
				success: false,
				message: "Only active bookings can be cancelled",
			});
			return;
		}

		const bookingDate = new Date(booking.date);
		const currentDate = new Date();
		const timeDiff = bookingDate.getTime() - currentDate.getTime();
		const hoursDiff = timeDiff / (1000 * 3600);

		if (hoursDiff < 24) {
			res.status(400).json({
				success: false,
				message:
					"Bookings can only be cancelled at least 24 hours in advance",
			});
			return;
		}

		booking.status = "cancelled";
		await booking.save();
		await booking.populate([
			{ path: "member", select: "name email profilePic" },
			{ path: "trainer", select: "name email profilePic" },
		]);

		res.status(200).json({
			success: true,
			message: "Booking cancelled successfully",
			data: { booking },
		});
	} catch (error) {
		console.error("Cancel booking error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while cancelling booking",
		});
	}
};

export const getTrainerBookings = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const trainerId = req.user?._id;

		const bookings = await Booking.find({ trainer: trainerId })
			.populate("member", "name email profilePic")
			.populate("trainer", "name email profilePic")
			.sort({ date: 1 });

		res.status(200).json({
			success: true,
			data: { bookings },
		});
	} catch (error) {
		console.error("Get trainer bookings error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching trainer bookings",
		});
	}
};
