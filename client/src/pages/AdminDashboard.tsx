import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useAttendanceStore } from "../store/attendanceStore";
import {
	FiUsers,
	FiTrash2,
	FiShield,
	FiUserCheck,
	FiDollarSign,
	FiCalendar,
	FiCamera,
	FiCode,
	FiX,
	FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import AdminMembershipManagement from "./AdminMembershipManagement";
import AdminSubscriptionManagement from "./AdminSubscriptionManagement";
import AttendanceQRScanner from "../components/AttendanceQRScanner";
import QRGenerator from "../components/QRGenerator";
import AttendanceCalendar from "../components/AttendanceCalendar";

interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "trainer" | "member";
	profilePic?: string;
	createdAt: string;
	updatedAt: string;
}

const AdminDashboard = () => {
	const { user, token } = useAuthStore();
	const { attendanceRecords, getAttendanceLogs, checkIn } =
		useAttendanceStore();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"users" | "memberships" | "subscriptions" | "attendance"
	>("users");

	// Attendance related state
	const [showQRScanner, setShowQRScanner] = useState(false);
	const [selectedUserForQR, setSelectedUserForQR] = useState<User | null>(
		null
	);
	const [showCalendar, setShowCalendar] = useState(false);
	const [selectedUserForCalendar, setSelectedUserForCalendar] =
		useState<User | null>(null);
	const [userAttendanceData, setUserAttendanceData] = useState<any[]>([]);

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_URL}/api/users`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (response.ok) {
				setUsers(data.data.users);
			} else {
				toast.error(data.message || "Failed to fetch users");
			}
		} catch (error) {
			toast.error("Error fetching users");
		} finally {
			setLoading(false);
		}
	};

	const updateUserRole = async (userId: string, newRole: string) => {
		try {
			const response = await fetch(
				`${API_URL}/api/users/${userId}/role`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ role: newRole }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				toast.success("User role updated successfully");
				fetchUsers();
			} else {
				toast.error(data.message || "Failed to update user role");
			}
		} catch (error) {
			toast.error("Error updating user role");
		}
	};

	const deleteUser = async (userId: string, userName: string) => {
		if (!confirm(`Are you sure you want to delete ${userName}?`)) {
			return;
		}

		try {
			const response = await fetch(`${API_URL}/api/users/${userId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("User deleted successfully");
				fetchUsers();
			} else {
				toast.error(data.message || "Failed to delete user");
			}
		} catch (error) {
			toast.error("Error deleting user");
		}
	};

	// Attendance functions
	const handleQRScan = async (userId: string, userName?: string) => {
		try {
			await checkIn(userId);
			toast.success(`Successfully checked in ${userName || "user"}!`);
		} catch (error) {
			console.error("Check-in error:", error);
			toast.error("Failed to check in user");
		}
	};

	const generateQRForUser = (user: User) => {
		setSelectedUserForQR(user);
	};

	const viewUserAttendance = async (user: User) => {
		try {
			await getAttendanceLogs({ userId: user.id });
			const userAttendance = attendanceRecords.filter(
				(record) => record.user.id === user.id
			);
			setUserAttendanceData(userAttendance);
			setSelectedUserForCalendar(user);
			setShowCalendar(true);
		} catch (error) {
			console.error("Error fetching user attendance:", error);
			toast.error("Failed to fetch user attendance");
		}
	};

	useEffect(() => {
		fetchUsers();
		if (activeTab === "attendance") {
			getAttendanceLogs();
		}
	}, [activeTab]);

	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center">
								<FiShield className="w-8 h-8 mr-3 text-red-600" />
								Admin Dashboard
							</h1>
							<p className="mt-2 text-lg text-gray-600">
								Manage all users and their roles
							</p>
						</div>
						<div className="text-right">
							<div className="text-sm text-gray-500">
								Total Users
							</div>
							<div className="text-2xl font-bold text-gray-900">
								{users.length}
							</div>
						</div>
					</div>
				</div>

				{/* Tab Navigation */}
				<div className="mb-6">
					<div className="border-b border-gray-200">
						{/* Desktop Navigation */}
						<nav className="hidden md:flex -mb-px space-x-2 lg:space-x-8 overflow-x-auto">
							<button
								onClick={() => setActiveTab("users")}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
									activeTab === "users"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<FiUsers className="w-4 h-4 inline mr-2" />
								User Management
							</button>
							<button
								onClick={() => setActiveTab("memberships")}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
									activeTab === "memberships"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<FiDollarSign className="w-4 h-4 inline mr-2" />
								Membership Plans
							</button>
							<button
								onClick={() => setActiveTab("subscriptions")}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
									activeTab === "subscriptions"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<FiCalendar className="w-4 h-4 inline mr-2" />
								User Subscriptions
							</button>
							<button
								onClick={() => setActiveTab("attendance")}
								className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
									activeTab === "attendance"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<FiUserCheck className="w-4 h-4 inline mr-2" />
								Attendance Management
							</button>
						</nav>

						{/* Mobile Navigation - Dropdown */}
						<div className="md:hidden mb-4">
							<label
								htmlFor="admin-tab-select"
								className="sr-only"
							>
								Select admin tab
							</label>
							<select
								id="admin-tab-select"
								value={activeTab}
								onChange={(e) =>
									setActiveTab(e.target.value as any)
								}
								className="w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
							>
								<option value="users">
									👥 User Management
								</option>
								<option value="memberships">
									💰 Membership Plans
								</option>
								<option value="subscriptions">
									📅 User Subscriptions
								</option>
								<option value="attendance">
									✅ Attendance Management
								</option>
							</select>
						</div>

						{/* Mobile Navigation - Grid (Alternative visual option) */}
						<div className="md:hidden grid grid-cols-2 gap-3 sm:gap-4">
							<button
								onClick={() => setActiveTab("users")}
								className={`flex flex-col items-center justify-center py-4 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
									activeTab === "users"
										? "bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm"
										: "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:shadow-sm"
								}`}
							>
								<FiUsers className="w-5 h-5 mb-2" />
								<span className="text-xs text-center leading-tight">
									User Mgmt
								</span>
							</button>
							<button
								onClick={() => setActiveTab("memberships")}
								className={`flex flex-col items-center justify-center py-4 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
									activeTab === "memberships"
										? "bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm"
										: "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:shadow-sm"
								}`}
							>
								<FiDollarSign className="w-5 h-5 mb-2" />
								<span className="text-xs text-center leading-tight">
									Plans
								</span>
							</button>
							<button
								onClick={() => setActiveTab("subscriptions")}
								className={`flex flex-col items-center justify-center py-4 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
									activeTab === "subscriptions"
										? "bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm"
										: "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:shadow-sm"
								}`}
							>
								<FiCalendar className="w-5 h-5 mb-2" />
								<span className="text-xs text-center leading-tight">
									Subscriptions
								</span>
							</button>
							<button
								onClick={() => setActiveTab("attendance")}
								className={`flex flex-col items-center justify-center py-4 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
									activeTab === "attendance"
										? "bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-sm"
										: "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:shadow-sm"
								}`}
							>
								<FiUserCheck className="w-5 h-5 mb-2" />
								<span className="text-xs text-center leading-tight">
									Attendance
								</span>
							</button>
						</div>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === "users" && (
					<div className="bg-white shadow-lg rounded-lg overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
							<h2 className="text-lg font-medium text-gray-900 flex items-center">
								<FiUsers className="w-5 h-5 mr-2" />
								User Management
							</h2>
						</div>

						{loading ? (
							<div className="p-12 text-center">
								<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								<p className="mt-4 text-gray-500">
									Loading users...
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												User
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Role
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Joined
											</th>
											<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{users.map((userData) => (
											<tr
												key={userData.id}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center">
														{userData.profilePic ? (
															<img
																src={`${API_URL}${userData.profilePic}`}
																alt="Profile"
																className="h-10 w-10 rounded-full object-cover"
															/>
														) : (
															<div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
																<FiUserCheck className="w-5 h-5 text-gray-600" />
															</div>
														)}
														<div className="ml-4">
															<div className="text-sm font-medium text-gray-900">
																{userData.name}
															</div>
															<div className="text-sm text-gray-500">
																{userData.email}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center space-x-3">
														<select
															value={
																userData.role
															}
															onChange={(e) =>
																updateUserRole(
																	userData.id,
																	e.target
																		.value
																)
															}
															className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
															disabled={
																userData.id ===
																user?.id
															}
															title={`Change role for ${userData.name}`}
														>
															<option value="member">
																Member
															</option>
															<option value="trainer">
																Trainer
															</option>
															<option value="admin">
																Admin
															</option>
														</select>
														<span
															className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
																userData.role ===
																"admin"
																	? "bg-red-100 text-red-800"
																	: userData.role ===
																	  "trainer"
																	? "bg-blue-100 text-blue-800"
																	: "bg-green-100 text-green-800"
															}`}
														>
															{userData.role}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{new Date(
														userData.createdAt
													).toLocaleDateString()}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													{userData.id !==
														user?.id && (
														<button
															onClick={() =>
																deleteUser(
																	userData.id,
																	userData.name
																)
															}
															className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
														>
															<FiTrash2 className="w-4 h-4 mr-1" />
															Delete
														</button>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{activeTab === "memberships" && <AdminMembershipManagement />}
				{activeTab === "subscriptions" && (
					<AdminSubscriptionManagement />
				)}

				{activeTab === "attendance" && (
					<div className="space-y-6">
						{/* Quick Actions Section */}
						<div className="bg-white shadow-lg rounded-lg overflow-hidden">
							<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
								<h2 className="text-lg font-medium text-gray-900 flex items-center">
									<FiUserCheck className="w-5 h-5 mr-2" />
									Attendance Management
								</h2>
							</div>

							<div className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
									<div className="bg-blue-50 p-6 rounded-lg">
										<h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
											<FiCamera className="mr-2" />
											QR Code Scanner
										</h3>
										<p className="text-blue-700 mb-4">
											Scan member QR codes for quick
											check-in
										</p>
										<button
											onClick={() =>
												setShowQRScanner(true)
											}
											className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
										>
											<FiCamera className="mr-2" />
											Open Scanner
										</button>
									</div>

									<div className="bg-green-50 p-6 rounded-lg">
										<h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
											<FiCode className="mr-2" />
											Generate QR Codes
										</h3>
										<p className="text-green-700 mb-4">
											Generate QR codes for members
										</p>
										<p className="text-sm text-green-600">
											Click on any user below to generate
											their QR code
										</p>
									</div>
								</div>

								{/* Quick Stats */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
									<div className="bg-gray-50 p-4 rounded-lg">
										<div className="flex items-center">
											<FiUsers className="w-8 h-8 text-blue-600 mr-3" />
											<div>
												<p className="text-sm font-medium text-gray-600">
													Total Users
												</p>
												<p className="text-2xl font-bold text-gray-900">
													{
														users.filter(
															(u) =>
																u.role !==
																"admin"
														).length
													}
												</p>
											</div>
										</div>
									</div>
									<div className="bg-green-50 p-4 rounded-lg">
										<div className="flex items-center">
											<FiUserCheck className="w-8 h-8 text-green-600 mr-3" />
											<div>
												<p className="text-sm font-medium text-green-600">
													Today's Check-ins
												</p>
												<p className="text-2xl font-bold text-green-900">
													{
														attendanceRecords.filter(
															(record) => {
																const today =
																	new Date();
																const recordDate =
																	new Date(
																		record.date
																	);
																return (
																	recordDate.toDateString() ===
																	today.toDateString()
																);
															}
														).length
													}
												</p>
											</div>
										</div>
									</div>
									<div className="bg-purple-50 p-4 rounded-lg">
										<div className="flex items-center">
											<FiClock className="w-8 h-8 text-purple-600 mr-3" />
											<div>
												<p className="text-sm font-medium text-purple-600">
													This Week
												</p>
												<p className="text-2xl font-bold text-purple-900">
													{
														attendanceRecords.filter(
															(record) => {
																const weekAgo =
																	new Date();
																weekAgo.setDate(
																	weekAgo.getDate() -
																		7
																);
																const recordDate =
																	new Date(
																		record.date
																	);
																return (
																	recordDate >=
																	weekAgo
																);
															}
														).length
													}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* User Attendance Tracker */}
						<div className="bg-white shadow-lg rounded-lg overflow-hidden">
							<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
								<h3 className="text-lg font-medium text-gray-900">
									User Attendance Tracker
								</h3>
							</div>

							{loading ? (
								<div className="p-12 text-center">
									<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
									<p className="mt-4 text-gray-500">
										Loading users...
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													User
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Role
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Actions
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{users
												.filter(
													(userData) =>
														userData.role !==
														"admin"
												)
												.map((userData) => (
													<tr
														key={userData.id}
														className="hover:bg-gray-50"
													>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="flex items-center">
																{userData.profilePic ? (
																	<img
																		src={`${API_URL}${userData.profilePic}`}
																		alt="Profile"
																		className="h-10 w-10 rounded-full object-cover"
																	/>
																) : (
																	<div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
																		<FiUserCheck className="w-5 h-5 text-gray-600" />
																	</div>
																)}
																<div className="ml-4">
																	<div className="text-sm font-medium text-gray-900">
																		{
																			userData.name
																		}
																	</div>
																	<div className="text-sm text-gray-500">
																		{
																			userData.email
																		}
																	</div>
																</div>
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
																	userData.role ===
																	"trainer"
																		? "bg-blue-100 text-blue-800"
																		: "bg-green-100 text-green-800"
																}`}
															>
																{userData.role}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
															<button
																onClick={() =>
																	generateQRForUser(
																		userData
																	)
																}
																className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
															>
																<FiCode className="w-4 h-4 mr-1" />
																QR Code
															</button>
															<button
																onClick={() =>
																	viewUserAttendance(
																		userData
																	)
																}
																className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
															>
																<FiCalendar className="w-4 h-4 mr-1" />
																View Calendar
															</button>
														</td>
													</tr>
												))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				)}

				{/* QR Scanner Modal */}
				<AttendanceQRScanner
					isVisible={showQRScanner}
					onScanSuccess={handleQRScan}
					onClose={() => setShowQRScanner(false)}
				/>

				{/* QR Generator Modal */}
				{selectedUserForQR && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900">
										QR Code for {selectedUserForQR.name}
									</h3>
									<button
										onClick={() =>
											setSelectedUserForQR(null)
										}
										className="text-gray-400 hover:text-gray-600"
										title="Close QR generator"
									>
										<FiX className="w-6 h-6" />
									</button>
								</div>
								<QRGenerator
									userId={selectedUserForQR.id}
									userName={selectedUserForQR.name}
								/>
								<div className="mt-4 text-center">
									<button
										onClick={() =>
											setSelectedUserForQR(null)
										}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Attendance Calendar Modal */}
				<AttendanceCalendar
					isOpen={showCalendar}
					onClose={() => setShowCalendar(false)}
					userId={selectedUserForCalendar?.id || ""}
					userName={selectedUserForCalendar?.name || ""}
					userAttendanceData={userAttendanceData}
				/>
			</main>
		</div>
	);
};

export default AdminDashboard;
