import { Response } from "express";
import User, { IUser } from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				user: {
					id: (req.user._id as string).toString(),
					name: req.user.name,
					email: req.user.email,
					role: req.user.role,
					profilePic: req.user.profilePic,
					createdAt: req.user.createdAt,
					updatedAt: req.user.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Get me error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching user profile",
		});
	}
};

export const updateMe = async (
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

		const { name, email } = req.body;
		const updateData: Partial<IUser> = {};

		if (name) updateData.name = name;
		if (email) updateData.email = email;
		if (req.file) {
			updateData.profilePic = `/uploads/profiles/${req.file.filename}`;
		}

		if (Object.keys(updateData).length === 0) {
			res.status(400).json({
				success: false,
				message: "No valid fields provided for update",
			});
			return;
		}

		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			updateData,
			{ new: true, runValidators: true }
		);

		if (!updatedUser) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: {
				user: {
					id: (updatedUser._id as string).toString(),
					name: updatedUser.name,
					email: updatedUser.email,
					role: updatedUser.role,
					profilePic: updatedUser.profilePic,
					createdAt: updatedUser.createdAt,
					updatedAt: updatedUser.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Update me error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating profile",
		});
	}
};

export const getAllUsers = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const users = await User.find({}).select("-password");

		res.status(200).json({
			success: true,
			data: {
				users: users.map((user) => ({
					id: (user._id as string).toString(),
					name: user.name,
					email: user.email,
					role: user.role,
					profilePic: user.profilePic,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				})),
			},
		});
	} catch (error) {
		console.error("Get all users error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching users",
		});
	}
};

export const updateUserRole = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { role } = req.body;

		if (!role || !["admin", "trainer", "member"].includes(role)) {
			res.status(400).json({
				success: false,
				message: "Valid role is required (admin, trainer, or member)",
			});
			return;
		}

		const user = await User.findByIdAndUpdate(
			id,
			{ role },
			{ new: true, runValidators: true }
		);

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "User role updated successfully",
			data: {
				user: {
					id: (user._id as string).toString(),
					name: user.name,
					email: user.email,
					role: user.role,
					profilePic: user.profilePic,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Update user role error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating user role",
		});
	}
};

export const deleteUser = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		if (req.user && (req.user._id as string).toString() === id) {
			res.status(400).json({
				success: false,
				message: "You cannot delete your own account",
			});
			return;
		}

		const user = await User.findByIdAndDelete(id);

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.error("Delete user error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while deleting user",
		});
	}
};
