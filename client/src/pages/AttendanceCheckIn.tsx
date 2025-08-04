import { useState, useEffect } from "react";
import {
	FiLogIn,
	FiUser,
	FiClock,
	FiCode,
	FiShield,
	FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAttendanceStore } from "../store/attendanceStore";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";
import AttendanceQRScanner from "../components/AttendanceQRScanner";
import QRGenerator from "../components/QRGenerator";

const AttendanceCheckIn = () => {
	const [memberId, setMemberId] = useState("");
	const [showScanner, setShowScanner] = useState(false);
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const {
		checkIn,
		getUserStatus,
		currentUserStatus,
		loading,
		error,
		clearError,
	} = useAttendanceStore();

	useEffect(() => {
		if (user?.id && user.role !== "admin") {
			getUserStatus(user.id);
		}

		if (user?.role === "member") {
			fetchUserSubscriptions();
		}
	}, [user?.id, getUserStatus, fetchUserSubscriptions, user?.role]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	useEffect(() => {
		if (
			user?.role === "member" &&
			userSubscriptions.length > 0 &&
			!hasActiveSubscription(userSubscriptions)
		) {
			toast.error(
				"You need an active subscription to access attendance features"
			);
			navigate("/membership-plans");
			return;
		}
	}, [user, userSubscriptions, navigate]);

	const handleCheckIn = async () => {
		try {
			const userId = memberId || user?.id;
			if (!userId) {
				toast.error("Please enter your member ID or log in");
				return;
			}

			await checkIn(userId);
			toast.success("Successfully checked in!");
			setMemberId("");
		} catch (error) {
			console.error("Check-in error:", error);
		}
	};

	const handleQRCodeScan = async (userId: string, userName?: string) => {
		try {
			await checkIn(userId);
			toast.success(`Successfully checked in ${userName || "user"}!`);
		} catch (error) {
			console.error("QR scan error:", error);
		}
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const hasCheckedInToday = currentUserStatus?.hasCheckedIn;

	if (user?.role === "member" && userSubscriptions.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow-md p-8">
						<div className="text-center">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
							<p className="text-gray-600">
								Loading subscription status...
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Redirect admins with message
	if (user?.role === "admin") {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-2xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow-md p-8">
						<div className="text-center">
							<FiShield className="mx-auto w-16 h-16 text-red-600 mb-4" />
							<h1 className="text-2xl font-bold text-gray-900 mb-4">
								Admin Access Restricted
							</h1>
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
								<div className="flex items-center">
									<FiAlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
									<div className="text-left">
										<h3 className="text-lg font-medium text-yellow-800">
											Attendance Not Required for Admins
										</h3>
										<p className="text-yellow-700 mt-1">
											As an administrator, you don't need
											to check in for attendance. Use the
											Admin Dashboard to manage user
											attendance and generate QR codes.
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-3">
								<p className="text-gray-600">
									You can access attendance management
									features from the Admin Dashboard:
								</p>
								<ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
									<li className="flex items-center">
										<FiCode className="w-4 h-4 mr-2 text-blue-600" />
										Generate QR codes for users
									</li>
									<li className="flex items-center">
										<FiUser className="w-4 h-4 mr-2 text-green-600" />
										View user attendance calendars
									</li>
									<li className="flex items-center">
										<FiClock className="w-4 h-4 mr-2 text-purple-600" />
										Access attendance logs and reports
									</li>
								</ul>
							</div>
							<div className="mt-8">
								<a
									href="/admin-dashboard"
									className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									<FiShield className="mr-2" />
									Go to Admin Dashboard
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Gym Attendance
						</h1>
						<p className="text-gray-600">
							Check in to the gym for today
						</p>
					</div>

					{currentUserStatus && (
						<div className="bg-blue-50 rounded-lg p-6 mb-8">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold text-gray-900 flex items-center">
									<FiUser className="mr-2" />
									{currentUserStatus.user.name}
								</h2>
								<div
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										hasCheckedInToday
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{hasCheckedInToday
										? "Checked In Today"
										: "Not Checked In"}
								</div>
							</div>

							{currentUserStatus.todayStatus && (
								<div className="flex items-center text-sm text-gray-600">
									<FiClock className="mr-2" />
									<span>
										Check-in:{" "}
										{formatTime(
											currentUserStatus.todayStatus
												.checkInTime
										)}
									</span>
								</div>
							)}

							{user && (
								<div className="mt-4">
									<QRGenerator
										userId={user.id}
										userName={user.name}
									/>
								</div>
							)}
						</div>
					)}

					{!user && (
						<div className="space-y-6 mb-8">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Member ID
								</label>
								<input
									type="text"
									value={memberId}
									onChange={(e) =>
										setMemberId(e.target.value)
									}
									placeholder="Enter your member ID"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div className="text-center">
								<p className="text-sm text-gray-600 mb-3">
									Or scan QR code
								</p>
								<button
									onClick={() => setShowScanner(true)}
									className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
								>
									<FiCode className="mr-2" />
									Scan QR Code
								</button>
							</div>
						</div>
					)}

					{!hasCheckedInToday && (
						<div className="flex gap-4">
							<button
								onClick={handleCheckIn}
								disabled={loading || (!user && !memberId)}
								className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
							>
								<FiLogIn className="mr-2 text-xl" />
								{loading ? "Checking In..." : "Check In"}
							</button>
						</div>
					)}

					{hasCheckedInToday && (
						<div className="text-center p-4 bg-green-50 rounded-lg">
							<FiCode className="mx-auto w-8 h-8 text-green-600 mb-2" />
							<p className="text-green-800 font-medium">
								You have already checked in today!
							</p>
							<p className="text-green-600 text-sm">
								See you at the gym!
							</p>
						</div>
					)}

					{!user && !memberId && (
						<p className="text-center text-sm text-gray-500 mt-4">
							Please enter your member ID or log in to continue
						</p>
					)}

					{/* QR Scanner Modal */}
					<AttendanceQRScanner
						isVisible={showScanner}
						onScanSuccess={handleQRCodeScan}
						onClose={() => setShowScanner(false)}
					/>
				</div>
			</div>
		</div>
	);
};

export default AttendanceCheckIn;
