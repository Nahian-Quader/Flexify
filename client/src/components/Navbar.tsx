import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { hasActiveSubscription } from "../lib/subscriptionUtils";
import {
	FiMenu,
	FiX,
	FiUser,
	FiLogOut,
	FiSettings,
	FiHome,
	FiUsers,
	FiShield,
	FiGift,
	FiClock,
	FiCalendar,
	FiTrendingUp,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Navbar = () => {
	const { user, isAuthenticated, logout } = useAuthStore();
	const { userSubscriptions, fetchUserSubscriptions } = useMembershipStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	// Fetch user subscriptions when user is authenticated and is a member
	useEffect(() => {
		if (isAuthenticated && user?.role === "member") {
			fetchUserSubscriptions();
		}
	}, [isAuthenticated, user?.role, fetchUserSubscriptions]);

	// Check if user has active subscription
	const userHasActiveSubscription = hasActiveSubscription(userSubscriptions);

	const handleLogout = () => {
		logout();
		toast.success("Logged out successfully");
		navigate("/");
		setIsProfileDropdownOpen(false);
		setIsMenuOpen(false);
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return <FiShield className="w-4 h-4" />;
			case "trainer":
				return <FiUsers className="w-4 h-4" />;
			default:
				return <FiUser className="w-4 h-4" />;
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "trainer":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-green-100 text-green-800";
		}
	};

	const getDashboardPath = () => {
		if (!user) return "/dashboard";
		switch (user.role) {
			case "admin":
				return "/admin";
			case "trainer":
				return "/trainer";
			default:
				return "/dashboard";
		}
	};

	const navigationItems = [
		{ name: "Home", href: "/", icon: <FiHome className="w-4 h-4" /> },

		// Show memberships only for:
		// 1. Non-authenticated users
		// 2. Members without active subscription
		// Hide for members with active subscription, trainers, and admins
		...(!isAuthenticated ||
		(user?.role === "member" && !userHasActiveSubscription)
			? [
					{
						name: "Memberships",
						href: "/memberships",
						icon: <FiGift className="w-4 h-4" />,
					},
			  ]
			: []),

		// Premium features - only show for members with active subscription
		...(isAuthenticated &&
		user?.role === "member" &&
		userHasActiveSubscription
			? [
					{
						name: "Trainers",
						href: "/trainers",
						icon: <FiUsers className="w-4 h-4" />,
					},
					{
						name: "My Bookings",
						href: "/my-bookings",
						icon: <FiCalendar className="w-4 h-4" />,
					},
					{
						name: "Progress",
						href: "/progress",
						icon: <FiTrendingUp className="w-4 h-4" />,
					},
			  ]
			: []),

		// Attendance for members with subscription and trainers (not admins)
		...(isAuthenticated &&
		user?.role !== "admin" &&
		(user?.role === "trainer" ||
			(user?.role === "member" && userHasActiveSubscription))
			? [
					{
						name: "Attendance",
						href: "/attendance",
						icon: <FiClock className="w-4 h-4" />,
					},
			  ]
			: []),

		// Dashboard for all authenticated users
		...(isAuthenticated
			? [
					{
						name: "Dashboard",
						href: getDashboardPath(),
						icon:
							user?.role === "admin" ? (
								<FiShield className="w-4 h-4" />
							) : user?.role === "trainer" ? (
								<FiUsers className="w-4 h-4" />
							) : (
								<FiUser className="w-4 h-4" />
							),
					},
			  ]
			: []),
	];

	return (
		<nav className="bg-white shadow-lg sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Logo and Brand */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
								<span className="text-white font-bold text-sm">
									F
								</span>
							</div>
							<span className="text-xl font-bold text-gray-900">
								Flexify
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{navigationItems.map((item) => (
							<Link
								key={item.name}
								to={item.href}
								className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
									location.pathname === item.href
										? "text-blue-600 bg-blue-50"
										: "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								{item.icon}
								<span>{item.name}</span>
							</Link>
						))}
					</div>

					{/* Auth Section */}
					<div className="hidden md:flex items-center space-x-4">
						{isAuthenticated ? (
							<div className="relative">
								<button
									onClick={() =>
										setIsProfileDropdownOpen(
											!isProfileDropdownOpen
										)
									}
									className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									<div className="flex items-center space-x-2">
										{user?.profilePic ? (
											<img
												src={`${API_URL}${user.profilePic}`}
												alt="Profile"
												className="h-8 w-8 rounded-full object-cover"
											/>
										) : (
											<div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
												<FiUser className="w-4 h-4 text-gray-600" />
											</div>
										)}
										<div className="text-left">
											<p className="text-sm font-medium text-gray-700">
												{user?.name}
											</p>
											<div
												className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
													user?.role || "member"
												)}`}
											>
												{getRoleIcon(
													user?.role || "member"
												)}
												<span>{user?.role}</span>
											</div>
										</div>
									</div>
								</button>

								{/* Profile Dropdown */}
								{isProfileDropdownOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
										<Link
											to="/profile"
											className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											onClick={() =>
												setIsProfileDropdownOpen(false)
											}
										>
											<FiSettings className="w-4 h-4" />
											<span>Profile Settings</span>
										</Link>
										<button
											onClick={handleLogout}
											className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										>
											<FiLogOut className="w-4 h-4" />
											<span>Sign Out</span>
										</button>
									</div>
								)}
							</div>
						) : (
							<div className="flex items-center space-x-4">
								<Link
									to="/login"
									className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
								>
									Sign In
								</Link>
								<Link
									to="/register"
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
						>
							{isMenuOpen ? (
								<FiX className="w-6 h-6" />
							) : (
								<FiMenu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden border-t border-gray-200 relative z-40">
						<div className="px-2 pt-2 pb-3 space-y-1">
							{navigationItems.map((item) => (
								<Link
									key={item.name}
									to={item.href}
									className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
										location.pathname === item.href
											? "text-blue-600 bg-blue-50"
											: "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
									}`}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.icon}
									<span>{item.name}</span>
								</Link>
							))}
						</div>

						{/* Mobile Auth Section */}
						<div className="pt-4 pb-3 border-t border-gray-200">
							{isAuthenticated ? (
								<div className="px-2 space-y-3">
									<div className="flex items-center px-3">
										{user?.profilePic ? (
											<img
												src={`${API_URL}${user.profilePic}`}
												alt="Profile"
												className="h-10 w-10 rounded-full object-cover"
											/>
										) : (
											<div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
												<FiUser className="w-5 h-5 text-gray-600" />
											</div>
										)}
										<div className="ml-3">
											<div className="text-base font-medium text-gray-800">
												{user?.name}
											</div>
											<div
												className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
													user?.role || "member"
												)}`}
											>
												{getRoleIcon(
													user?.role || "member"
												)}
												<span>{user?.role}</span>
											</div>
										</div>
									</div>
									<div className="space-y-1">
										<Link
											to="/profile"
											className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
											onClick={() => setIsMenuOpen(false)}
										>
											<FiSettings className="w-4 h-4" />
											<span>Profile Settings</span>
										</Link>
										<button
											onClick={handleLogout}
											className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
										>
											<FiLogOut className="w-4 h-4" />
											<span>Sign Out</span>
										</button>
									</div>
								</div>
							) : (
								<div className="px-2 space-y-1">
									<Link
										to="/login"
										className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
										onClick={() => setIsMenuOpen(false)}
									>
										Sign In
									</Link>
									<Link
										to="/register"
										className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
										onClick={() => setIsMenuOpen(false)}
									>
										Sign Up
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Overlay for mobile dropdown */}
			{(isMenuOpen || isProfileDropdownOpen) && (
				<div
					className="fixed inset-0 z-30  md:hidden"
					onClick={() => {
						setIsMenuOpen(false);
						setIsProfileDropdownOpen(false);
					}}
				/>
			)}
		</nav>
	);
};

export default Navbar;
