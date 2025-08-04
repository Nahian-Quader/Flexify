import { Request, Response } from "express";
import Attendance, { IAttendance } from "../models/Attendance";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const checkIn = async (req: Request, res: Response): Promise<void> => {
	try {
		const { userId, memberId } = req.body;

		if (!userId && !memberId) {
			res.status(400).json({
				success: false,
				message: "User ID or Member ID is required",
			});
			return;
		}

		let user;
		if (userId) {
			user = await User.findById(userId);
		} else {
			user = await User.findById(memberId);
		}

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const existingAttendance = await Attendance.findOne({
			user: user._id,
			date: today,
		});

		if (existingAttendance) {
			res.status(400).json({
				success: false,
				message: "User has already checked in today",
			});
			return;
		}

		const attendance = new Attendance({
			user: user._id,
			checkInTime: new Date(),
			date: today,
		});

		await attendance.save();

		res.status(201).json({
			success: true,
			message: `${user.name} checked in successfully`,
			data: {
				attendance: {
					id: (attendance._id as string).toString(),
					user: {
						id: (user._id as string).toString(),
						name: user.name,
						email: user.email,
					},
					checkInTime: attendance.checkInTime,
					date: attendance.date,
				},
			},
		});
	} catch (error) {
		console.error("Check-in error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during check-in",
		});
	}
};

export const getAttendanceLogs = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
			return;
		}

		const { startDate, endDate, userId } = req.query;

		const query: any = {};

		if (startDate && endDate) {
			const start = new Date(startDate as string);
			const end = new Date(endDate as string);
			start.setHours(0, 0, 0, 0);
			end.setHours(23, 59, 59, 999);
			query.date = { $gte: start, $lte: end };
		}

		if (userId) {
			query.user = userId;
		}

		const attendanceLogs = await Attendance.find(query)
			.populate("user", "name email profilePic")
			.sort({ date: -1, checkInTime: -1 })
			.lean();

		const formattedLogs = attendanceLogs.map((log) => ({
			id: log._id.toString(),
			user: {
				id: (log.user as any)._id.toString(),
				name: (log.user as any).name,
				email: (log.user as any).email,
				profilePic: (log.user as any).profilePic,
			},
			checkInTime: log.checkInTime,
			date: log.date,
		}));

		res.status(200).json({
			success: true,
			data: {
				logs: formattedLogs,
				total: formattedLogs.length,
			},
		});
	} catch (error) {
		console.error("Get attendance logs error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching attendance logs",
		});
	}
};

export const getUserAttendanceStatus = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const todayAttendance = await Attendance.findOne({
			user: userId,
			date: today,
		});

		res.status(200).json({
			success: true,
			data: {
				user: {
					id: (user._id as string).toString(),
					name: user.name,
					email: user.email,
				},
				todayStatus: todayAttendance
					? {
							checkInTime: todayAttendance.checkInTime,
					  }
					: null,
				hasCheckedIn: !!todayAttendance,
			},
		});
	} catch (error) {
		console.error("Get user attendance status error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching attendance status",
		});
	}
};
