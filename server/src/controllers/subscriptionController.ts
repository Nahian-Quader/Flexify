import { Response } from "express";
import UserSubscription, {
	IUserSubscription,
} from "../models/UserSubscription";
import MembershipPlan from "../models/MembershipPlan";
import { AuthRequest } from "../middleware/auth";

export const getUserSubscriptions = async (
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

		// Check if user is a member
		if (req.user.role !== "member") {
			res.status(403).json({
				success: false,
				message: "Subscription features are only available for members",
			});
			return;
		}

		const subscriptions = await UserSubscription.find({
			user: req.user._id,
		})
			.populate(
				"membershipPlan",
				"name durationInMonths price description"
			)
			.sort({ createdAt: -1 });

		subscriptions.forEach((sub) => {
			const now = new Date();
			sub.status =
				now >= sub.startDate && now <= sub.endDate
					? "active"
					: "expired";
		});

		res.status(200).json({
			success: true,
			data: {
				subscriptions: subscriptions.map((sub) => ({
					id: (sub._id as string).toString(),
					membershipPlan: sub.membershipPlan,
					startDate: sub.startDate,
					endDate: sub.endDate,
					status: sub.status,
					createdAt: sub.createdAt,
					updatedAt: sub.updatedAt,
				})),
			},
		});
	} catch (error) {
		console.error("Get user subscriptions error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching subscriptions",
		});
	}
};

export const createSubscription = async (
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

		// Check if user is a member
		if (req.user.role !== "member") {
			res.status(403).json({
				success: false,
				message: "Subscription features are only available for members",
			});
			return;
		}

		const { membershipPlanId } = req.body;

		if (!membershipPlanId) {
			res.status(400).json({
				success: false,
				message: "Membership plan ID is required",
			});
			return;
		}

		const membershipPlan = await MembershipPlan.findById(membershipPlanId);
		if (!membershipPlan) {
			res.status(404).json({
				success: false,
				message: "Membership plan not found",
			});
			return;
		}

		// Check if user has an active subscription
		const activeSubscription = await UserSubscription.findOne({
			user: req.user._id,
			status: "active",
			endDate: { $gte: new Date() },
		});

		// If user has an active subscription, expire it to allow plan change
		if (activeSubscription) {
			activeSubscription.status = "expired";
			activeSubscription.endDate = new Date(); // Set end date to now
			await activeSubscription.save();
		}

		const startDate = new Date();
		const endDate = new Date();
		endDate.setMonth(endDate.getMonth() + membershipPlan.durationInMonths);

		const subscription: IUserSubscription = new UserSubscription({
			user: req.user._id,
			membershipPlan: membershipPlanId,
			startDate,
			endDate,
			status: "active",
		});

		await subscription.save();
		await subscription.populate(
			"membershipPlan",
			"name durationInMonths price description"
		);

		res.status(201).json({
			success: true,
			message: activeSubscription
				? "Subscription plan changed successfully"
				: "Subscription created successfully",
			data: {
				subscription: {
					id: (subscription._id as string).toString(),
					membershipPlan: subscription.membershipPlan,
					startDate: subscription.startDate,
					endDate: subscription.endDate,
					status: subscription.status,
					createdAt: subscription.createdAt,
					updatedAt: subscription.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Create subscription error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while creating subscription",
		});
	}
};

export const getAllSubscriptions = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { status } = req.query;
		const filter: any = {};

		if (status && (status === "active" || status === "expired")) {
			filter.status = status;
		}

		const subscriptions = await UserSubscription.find(filter)
			.populate("user", "name email role")
			.populate(
				"membershipPlan",
				"name durationInMonths price description"
			)
			.sort({ createdAt: -1 });

		subscriptions.forEach((sub) => {
			const now = new Date();
			sub.status =
				now >= sub.startDate && now <= sub.endDate
					? "active"
					: "expired";
		});

		res.status(200).json({
			success: true,
			data: {
				subscriptions: subscriptions.map((sub) => ({
					id: (sub._id as string).toString(),
					user: sub.user,
					membershipPlan: sub.membershipPlan,
					startDate: sub.startDate,
					endDate: sub.endDate,
					status: sub.status,
					createdAt: sub.createdAt,
					updatedAt: sub.updatedAt,
				})),
			},
		});
	} catch (error) {
		console.error("Get all subscriptions error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching subscriptions",
		});
	}
};
