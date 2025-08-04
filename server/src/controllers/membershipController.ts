import { Response } from "express";
import MembershipPlan, { IMembershipPlan } from "../models/MembershipPlan";
import { AuthRequest } from "../middleware/auth";

export const getAllMembershipPlans = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const plans = await MembershipPlan.find({}).sort({ price: 1 });

		res.status(200).json({
			success: true,
			data: {
				plans: plans.map((plan) => ({
					id: (plan._id as string).toString(),
					name: plan.name,
					durationInMonths: plan.durationInMonths,
					price: plan.price,
					description: plan.description,
					createdAt: plan.createdAt,
					updatedAt: plan.updatedAt,
				})),
			},
		});
	} catch (error) {
		console.error("Get all membership plans error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching membership plans",
		});
	}
};

export const createMembershipPlan = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { name, durationInMonths, price, description } = req.body;

		if (!name || !durationInMonths || price === undefined) {
			res.status(400).json({
				success: false,
				message: "Please provide name, duration, and price",
			});
			return;
		}

		const existingPlan = await MembershipPlan.findOne({ name });
		if (existingPlan) {
			res.status(400).json({
				success: false,
				message: "Membership plan with this name already exists",
			});
			return;
		}

		const plan: IMembershipPlan = new MembershipPlan({
			name,
			durationInMonths,
			price,
			description,
		});

		await plan.save();

		res.status(201).json({
			success: true,
			message: "Membership plan created successfully",
			data: {
				plan: {
					id: (plan._id as string).toString(),
					name: plan.name,
					durationInMonths: plan.durationInMonths,
					price: plan.price,
					description: plan.description,
					createdAt: plan.createdAt,
					updatedAt: plan.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Create membership plan error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while creating membership plan",
		});
	}
};

export const updateMembershipPlan = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { name, durationInMonths, price, description } = req.body;

		const updateData: Partial<IMembershipPlan> = {};
		if (name) updateData.name = name;
		if (durationInMonths) updateData.durationInMonths = durationInMonths;
		if (price !== undefined) updateData.price = price;
		if (description !== undefined) updateData.description = description;

		if (Object.keys(updateData).length === 0) {
			res.status(400).json({
				success: false,
				message: "No valid fields provided for update",
			});
			return;
		}

		if (name) {
			const existingPlan = await MembershipPlan.findOne({
				name,
				_id: { $ne: id },
			});
			if (existingPlan) {
				res.status(400).json({
					success: false,
					message: "Membership plan with this name already exists",
				});
				return;
			}
		}

		const plan = await MembershipPlan.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!plan) {
			res.status(404).json({
				success: false,
				message: "Membership plan not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Membership plan updated successfully",
			data: {
				plan: {
					id: (plan._id as string).toString(),
					name: plan.name,
					durationInMonths: plan.durationInMonths,
					price: plan.price,
					description: plan.description,
					createdAt: plan.createdAt,
					updatedAt: plan.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Update membership plan error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating membership plan",
		});
	}
};

export const deleteMembershipPlan = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const plan = await MembershipPlan.findByIdAndDelete(id);

		if (!plan) {
			res.status(404).json({
				success: false,
				message: "Membership plan not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Membership plan deleted successfully",
		});
	} catch (error) {
		console.error("Delete membership plan error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while deleting membership plan",
		});
	}
};
