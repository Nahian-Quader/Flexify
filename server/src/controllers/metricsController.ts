import { Response } from "express";
import Metrics, { IMetrics } from "../models/Metrics";
import { AuthRequest } from "../middleware/auth";

export const createMetrics = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {
			date,
			weight,
			bodyFat,
			muscleMass,
			waist,
			chest,
			hips,
			biceps,
			thighs,
			height,
		} = req.body;

		if (!date || !weight) {
			res.status(400).json({
				success: false,
				message: "Date and weight are required",
			});
			return;
		}

		const existingMetrics = await Metrics.findOne({
			user: userId,
			date: new Date(date),
		});

		if (existingMetrics) {
			res.status(400).json({
				success: false,
				message: "Metrics entry already exists for this date",
			});
			return;
		}

		const metrics = new Metrics({
			user: userId,
			date: new Date(date),
			weight,
			bodyFat,
			muscleMass,
			waist,
			chest,
			hips,
			biceps,
			thighs,
			height,
		});

		await metrics.save();

		res.status(201).json({
			success: true,
			data: {
				metrics: {
					id: (metrics._id as string).toString(),
					date: metrics.date,
					weight: metrics.weight,
					bodyFat: metrics.bodyFat,
					muscleMass: metrics.muscleMass,
					waist: metrics.waist,
					chest: metrics.chest,
					hips: metrics.hips,
					biceps: metrics.biceps,
					thighs: metrics.thighs,
					height: metrics.height,
					createdAt: metrics.createdAt,
					updatedAt: metrics.updatedAt,
				},
			},
			message: "Metrics entry created successfully",
		});
	} catch (error) {
		console.error("Create metrics error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while creating metrics entry",
		});
	}
};

export const getMyMetrics = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const { startDate, endDate } = req.query;

		let dateFilter: any = { user: userId };

		if (startDate || endDate) {
			dateFilter.date = {};
			if (startDate) {
				dateFilter.date.$gte = new Date(startDate as string);
			}
			if (endDate) {
				dateFilter.date.$lte = new Date(endDate as string);
			}
		}

		const metrics = await Metrics.find(dateFilter).sort({ date: -1 });

		res.status(200).json({
			success: true,
			data: {
				metrics: metrics.map((metric) => ({
					id: (metric._id as string).toString(),
					date: metric.date,
					weight: metric.weight,
					bodyFat: metric.bodyFat,
					muscleMass: metric.muscleMass,
					waist: metric.waist,
					chest: metric.chest,
					hips: metric.hips,
					biceps: metric.biceps,
					thighs: metric.thighs,
					height: metric.height,
					createdAt: metric.createdAt,
					updatedAt: metric.updatedAt,
				})),
			},
		});
	} catch (error) {
		console.error("Get my metrics error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching metrics",
		});
	}
};

export const updateMetrics = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const { id } = req.params;
		const {
			date,
			weight,
			bodyFat,
			muscleMass,
			waist,
			chest,
			hips,
			biceps,
			thighs,
			height,
		} = req.body;

		const metrics = await Metrics.findOne({ _id: id, user: userId });

		if (!metrics) {
			res.status(404).json({
				success: false,
				message: "Metrics entry not found",
			});
			return;
		}

		if (date) metrics.date = new Date(date);
		if (weight !== undefined) metrics.weight = weight;
		if (bodyFat !== undefined) metrics.bodyFat = bodyFat;
		if (muscleMass !== undefined) metrics.muscleMass = muscleMass;
		if (waist !== undefined) metrics.waist = waist;
		if (chest !== undefined) metrics.chest = chest;
		if (hips !== undefined) metrics.hips = hips;
		if (biceps !== undefined) metrics.biceps = biceps;
		if (thighs !== undefined) metrics.thighs = thighs;
		if (height !== undefined) metrics.height = height;

		await metrics.save();

		res.status(200).json({
			success: true,
			data: {
				metrics: {
					id: (metrics._id as string).toString(),
					date: metrics.date,
					weight: metrics.weight,
					bodyFat: metrics.bodyFat,
					muscleMass: metrics.muscleMass,
					waist: metrics.waist,
					chest: metrics.chest,
					hips: metrics.hips,
					biceps: metrics.biceps,
					thighs: metrics.thighs,
					height: metrics.height,
					createdAt: metrics.createdAt,
					updatedAt: metrics.updatedAt,
				},
			},
			message: "Metrics entry updated successfully",
		});
	} catch (error) {
		console.error("Update metrics error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating metrics entry",
		});
	}
};

export const deleteMetrics = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const { id } = req.params;

		const metrics = await Metrics.findOneAndDelete({
			_id: id,
			user: userId,
		});

		if (!metrics) {
			res.status(404).json({
				success: false,
				message: "Metrics entry not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Metrics entry deleted successfully",
		});
	} catch (error) {
		console.error("Delete metrics error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while deleting metrics entry",
		});
	}
};
