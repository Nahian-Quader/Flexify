import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
	user?: IUser;
}

export const authMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				success: false,
				message: "Access denied. No token provided or invalid format.",
			});
			return;
		}

		const token = authHeader.substring(7);

		if (!process.env.JWT_SECRET) {
			res.status(500).json({
				success: false,
				message: "JWT secret is not configured",
			});
			return;
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
			userId: string;
			role: string;
		};

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			res.status(401).json({
				success: false,
				message: "Invalid token. User not found.",
			});
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({
				success: false,
				message: "Invalid token",
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: "Server error during authentication",
		});
	}
};

export const roleMiddleware = (allowedRoles: string[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({
				success: false,
				message: "Access denied. Insufficient permissions.",
			});
			return;
		}

		next();
	};
};
