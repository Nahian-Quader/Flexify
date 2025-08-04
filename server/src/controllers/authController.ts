import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const generateToken = (userId: string, role: string): string => {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET is not defined");
	}
	return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			res.status(400).json({
				success: false,
				message: "Please provide name, email, and password",
			});
			return;
		}

		if (password.length < 6) {
			res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters long",
			});
			return;
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({
				success: false,
				message: "User with this email already exists",
			});
			return;
		}

		const profilePic = req.file
			? `/uploads/profiles/${req.file.filename}`
			: "";

		const user: IUser = new User({
			name,
			email,
			password,
			profilePic,
		});

		await user.save();

		const token = generateToken((user._id as string).toString(), user.role);

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: {
				user: {
					id: (user._id as string).toString(),
					name: user.name,
					email: user.email,
					role: user.role,
					profilePic: user.profilePic,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during registration",
		});
	}
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({
				success: false,
				message: "Please provide email and password",
			});
			return;
		}

		const user: IUser | null = await User.findOne({ email });
		if (!user) {
			res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
			return;
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
			return;
		}

		const token = generateToken((user._id as string).toString(), user.role);

		res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				user: {
					id: (user._id as string).toString(),
					name: user.name,
					email: user.email,
					role: user.role,
					profilePic: user.profilePic,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during login",
		});
	}
};

export const logout = async (req: Request, res: Response): Promise<void> => {
	res.status(200).json({
		success: true,
		message: "Logout successful",
	});
};
