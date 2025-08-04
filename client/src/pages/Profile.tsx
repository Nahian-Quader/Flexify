import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import {
	FiUser,
	FiEdit3,
	FiCamera,
	FiSave,
	FiX,
	FiShield,
	FiUsers,
	FiUserCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Profile = () => {
	const { user, updateProfile, loading } = useAuthStore();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [profilePic, setProfilePic] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name,
				email: user.email,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate password fields if trying to change password
		if (
			formData.newPassword ||
			formData.confirmPassword ||
			formData.currentPassword
		) {
			if (!formData.currentPassword) {
				toast.error("Current password is required to change password");
				return;
			}
			if (!formData.newPassword) {
				toast.error("New password is required");
				return;
			}
			if (formData.newPassword !== formData.confirmPassword) {
				toast.error("New passwords do not match");
				return;
			}
			if (formData.newPassword.length < 6) {
				toast.error("New password must be at least 6 characters long");
				return;
			}
		}

		try {
			const submitData = new FormData();
			submitData.append("name", formData.name);
			submitData.append("email", formData.email);
			if (profilePic) {
				submitData.append("profilePic", profilePic);
			}
			// Note: Password change functionality would need additional backend endpoint
			// For now, we'll only update name, email, and profile picture

			await updateProfile(submitData);
			toast.success("Profile updated successfully!");
			setIsEditing(false);
			setProfilePic(null);
			setPreviewUrl("");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Profile update failed"
			);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setProfilePic(file);

			// Create preview URL
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const cancelEdit = () => {
		setIsEditing(false);
		setFormData({
			name: user?.name || "",
			email: user?.email || "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
		setProfilePic(null);
		setPreviewUrl("");
	};

	const getRoleIcon = () => {
		switch (user?.role) {
			case "admin":
				return <FiShield className="w-6 h-6 text-red-600" />;
			case "trainer":
				return <FiUsers className="w-6 h-6 text-blue-600" />;
			default:
				return <FiUserCheck className="w-6 h-6 text-green-600" />;
		}
	};

	const getRoleBadgeColor = () => {
		switch (user?.role) {
			case "admin":
				return "bg-red-100 text-red-800 border-red-200";
			case "trainer":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-green-100 text-green-800 border-green-200";
		}
	};

	const currentProfilePic =
		previewUrl || (user?.profilePic ? `${API_URL}${user.profilePic}` : "");

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						My Profile
					</h1>
					<p className="text-lg text-gray-600">
						Manage your personal information and preferences
					</p>
				</div>

				{/* Main Profile Card */}
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* Cover Background */}
					<div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
						<div className="absolute inset-0 bg-black bg-opacity-20"></div>
					</div>

					{/* Profile Content */}
					<div className="relative px-6 pb-6">
						{/* Profile Picture */}
						<div className="flex justify-center -mt-16 mb-6">
							<div className="relative">
								{currentProfilePic ? (
									<img
										src={currentProfilePic}
										alt="Profile"
										className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
									/>
								) : (
									<div className="w-32 h-32 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
										<FiUser className="w-12 h-12 text-white" />
									</div>
								)}

								{isEditing && (
									<label
										htmlFor="profile-picture-upload"
										className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors"
									>
										<FiCamera className="w-4 h-4" />
										<input
											id="profile-picture-upload"
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="hidden"
											title="Upload profile picture"
										/>
									</label>
								)}
							</div>
						</div>

						{/* User Info */}
						<div className="text-center mb-8">
							{isEditing ? (
								<form
									onSubmit={handleSubmit}
									className="space-y-8"
								>
									<div className="max-w-2xl mx-auto">
										{/* Basic Information */}
										<div className="bg-gray-50 rounded-xl p-6 mb-6">
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Basic Information
											</h3>
											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Full Name
													</label>
													<input
														type="text"
														name="name"
														value={formData.name}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
														placeholder="Enter your full name"
														required
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Email Address
													</label>
													<input
														type="email"
														name="email"
														value={formData.email}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
														placeholder="Enter your email"
														required
													/>
												</div>
											</div>
										</div>

										{/* Password Change */}
										<div className="bg-gray-50 rounded-xl p-6 mb-6">
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Change Password (Optional)
											</h3>
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Current Password
													</label>
													<input
														type="password"
														name="currentPassword"
														value={
															formData.currentPassword
														}
														onChange={handleChange}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
														placeholder="Enter current password"
													/>
												</div>
												<div className="grid md:grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-2">
															New Password
														</label>
														<input
															type="password"
															name="newPassword"
															value={
																formData.newPassword
															}
															onChange={
																handleChange
															}
															className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
															placeholder="Enter new password"
															minLength={6}
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-2">
															Confirm New Password
														</label>
														<input
															type="password"
															name="confirmPassword"
															value={
																formData.confirmPassword
															}
															onChange={
																handleChange
															}
															className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
															placeholder="Confirm new password"
															minLength={6}
														/>
													</div>
												</div>
												{formData.newPassword &&
													formData.confirmPassword &&
													formData.newPassword !==
														formData.confirmPassword && (
														<p className="text-red-600 text-sm mt-2">
															Passwords do not
															match
														</p>
													)}
												{formData.newPassword &&
													formData.newPassword
														.length > 0 &&
													formData.newPassword
														.length < 6 && (
														<p className="text-red-600 text-sm mt-2">
															Password must be at
															least 6 characters
															long
														</p>
													)}
											</div>
										</div>
									</div>

									<div className="flex justify-center space-x-4">
										<button
											type="submit"
											disabled={
												loading ||
												(formData.newPassword !== "" &&
													formData.newPassword !==
														formData.confirmPassword) ||
												(formData.newPassword !== "" &&
													formData.newPassword
														.length < 6)
											}
											className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
										>
											<FiSave className="w-5 h-5 mr-2" />
											{loading
												? "Saving..."
												: "Save Changes"}
										</button>
										<button
											type="button"
											onClick={cancelEdit}
											className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
										>
											<FiX className="w-5 h-5 mr-2" />
											Cancel
										</button>
									</div>
								</form>
							) : (
								<>
									<h2 className="text-3xl font-bold text-gray-900 mb-2">
										{user?.name}
									</h2>
									<p className="text-lg text-gray-600 mb-4">
										{user?.email}
									</p>

									<div className="flex justify-center mb-6">
										<span
											className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getRoleBadgeColor()}`}
										>
											{getRoleIcon()}
											<span className="ml-2 capitalize">
												{user?.role}
											</span>
										</span>
									</div>

									<button
										onClick={() => setIsEditing(true)}
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
									>
										<FiEdit3 className="w-5 h-5 mr-2" />
										Edit Profile
									</button>
								</>
							)}
						</div>

						{/* Profile Details */}
						{!isEditing && (
							<div className="max-w-2xl mx-auto">
								{/* Account Information */}
								<div className="bg-gray-50 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
										<FiUser className="w-5 h-5 mr-2 text-blue-600" />
										Account Information
									</h3>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Full Name
											</span>
											<span className="font-medium text-gray-900">
												{user?.name}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Email
											</span>
											<span className="font-medium text-gray-900">
												{user?.email}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Role
											</span>
											<span className="font-medium text-gray-900 capitalize">
												{user?.role}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Member Since
											</span>
											<span className="font-medium text-gray-900">
												{user?.createdAt
													? new Date(
															user.createdAt
													  ).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "long",
																day: "numeric",
															}
													  )
													: "N/A"}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Last Updated
											</span>
											<span className="font-medium text-gray-900">
												{user?.updatedAt
													? new Date(
															user.updatedAt
													  ).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "long",
																day: "numeric",
															}
													  )
													: "N/A"}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Additional Information */}
				{!isEditing && (
					<div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							Account Summary
						</h3>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-center">
								<FiUser className="w-6 h-6 text-blue-600 mr-3" />
								<div>
									<h4 className="text-lg font-medium text-blue-900">
										Welcome to Flexify
									</h4>
									<p className="text-blue-700 mt-1">
										Your profile is set up and ready. Gym
										management features like workout
										tracking, progress monitoring, and
										session booking will be available in
										future releases.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;
