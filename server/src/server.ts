import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/database";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import metricsRoutes from "./routes/metricsRoutes";

const app: Application = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

app.get("/", (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Flexify API is running",
		endpoints: {
			auth: {
				register: "POST /api/auth/register",
				login: "POST /api/auth/login",
				logout: "POST /api/auth/logout",
			},
			users: {
				profile: "GET /api/users/me",
				updateProfile: "PATCH /api/users/me",
				getAllUsers: "GET /api/users (admin only)",
				updateRole: "PATCH /api/users/:id/role (admin only)",
				deleteUser: "DELETE /api/users/:id (admin only)",
			},
			memberships: {
				getAllPlans: "GET /api/memberships",
				createPlan: "POST /api/memberships (admin only)",
				updatePlan: "PATCH /api/memberships/:id (admin only)",
				deletePlan: "DELETE /api/memberships/:id (admin only)",
			},
			subscriptions: {
				getUserSubscriptions: "GET /api/subscriptions/me",
				createSubscription: "POST /api/subscriptions",
				getAllSubscriptions: "GET /api/subscriptions (admin only)",
			},
			attendance: {
				checkIn: "POST /api/attendance/checkin",
				checkOut: "POST /api/attendance/checkout",
				getUserStatus: "GET /api/attendance/status/:userId",
				getLogs: "GET /api/attendance/logs (admin/trainer only)",
			},
			schedule: {
				myAvailability:
					"GET /api/schedule/my-availability (trainer only)",
				createAvailability:
					"POST /api/schedule/availability (trainer only)",
				updateAvailability:
					"PATCH /api/schedule/availability/:id (trainer only)",
				deleteAvailability:
					"DELETE /api/schedule/availability/:id (trainer only)",
				getAllTrainers: "GET /api/schedule/trainers",
				bookSession: "POST /api/schedule/book (member only)",
				myBookings: "GET /api/schedule/my-bookings (member only)",
				cancelBooking:
					"PATCH /api/schedule/bookings/:id/cancel (member only)",
				trainerBookings:
					"GET /api/schedule/trainer-bookings (trainer only)",
			},
			metrics: {
				createMetrics: "POST /api/metrics",
				getMyMetrics: "GET /api/metrics/me",
				updateMetrics: "PATCH /api/metrics/:id",
				deleteMetrics: "DELETE /api/metrics/:id",
			},
		},
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/metrics", metricsRoutes);

app.use("*", (req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: `Route ${req.originalUrl} not found`,
	});
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error("Global Error:", err.stack);

	res.status(500).json({
		success: false,
		message: "Something went wrong!",
		error:
			process.env.NODE_ENV === "development"
				? err.message
				: "Internal server error",
	});
});

app.listen(PORT, () => {
	console.log(`🚀 Server is running on port ${PORT}`);
	console.log(`📍 Server URL: http://localhost:${PORT}`);
	console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
