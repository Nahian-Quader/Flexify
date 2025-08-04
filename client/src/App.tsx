import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthCheck from "./components/AuthCheck";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import MembershipPlans from "./pages/MembershipPlans";
import AdminMembershipManagement from "./pages/AdminMembershipManagement";
import AdminSubscriptionManagement from "./pages/AdminSubscriptionManagement";
import AttendanceCheckIn from "./pages/AttendanceCheckIn";
import AttendanceLogs from "./pages/AttendanceLogs";
import TrainersPage from "./pages/TrainersPage";
import BookSession from "./pages/BookSession";
import MyBookings from "./pages/MyBookings";
import Progress from "./pages/Progress";
import { useAuthStore } from "./store/authStore";
import "./App.css";

function App() {
	const { isAuthenticated } = useAuthStore();

	return (
		<Router>
			<AuthCheck>
				<div className="min-h-screen bg-gray-50">
					<Navbar />
					<Toaster
						position="top-right"
						toastOptions={{
							duration: 4000,
							style: {
								background: "#ffffff",
								color: "#374151",
								border: "1px solid #e5e7eb",
								borderRadius: "0.75rem",
								boxShadow:
									"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
							},
							success: {
								iconTheme: {
									primary: "#10b981",
									secondary: "#ffffff",
								},
							},
							error: {
								iconTheme: {
									primary: "#ef4444",
									secondary: "#ffffff",
								},
							},
						}}
					/>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route
							path="/memberships"
							element={<MembershipPlans />}
						/>
						<Route
							path="/login"
							element={
								isAuthenticated ? (
									<Navigate to="/dashboard" replace />
								) : (
									<Login />
								)
							}
						/>
						<Route
							path="/register"
							element={
								isAuthenticated ? (
									<Navigate to="/dashboard" replace />
								) : (
									<Register />
								)
							}
						/>
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<AdminDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/memberships"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<AdminMembershipManagement />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/admin/subscriptions"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<AdminSubscriptionManagement />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/trainer"
							element={
								<ProtectedRoute allowedRoles={["trainer"]}>
									<TrainerDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/attendance"
							element={
								<ProtectedRoute
									allowedRoles={["member", "trainer"]}
									requiresSubscription={true}
								>
									<AttendanceCheckIn />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/attendance/logs"
							element={
								<ProtectedRoute
									allowedRoles={["admin", "trainer"]}
								>
									<AttendanceLogs />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/trainers"
							element={
								<ProtectedRoute allowedRoles={["member"]}>
									<TrainersPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/book-session"
							element={
								<ProtectedRoute allowedRoles={["member"]}>
									<BookSession />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/my-bookings"
							element={
								<ProtectedRoute allowedRoles={["member"]}>
									<MyBookings />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/progress"
							element={
								<ProtectedRoute allowedRoles={["member"]}>
									<Progress />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</div>
			</AuthCheck>
		</Router>
	);
}

export default App;
