import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface ProfileUpdateProps {
	onClose: () => void;
}

const ProfileUpdate = ({ onClose }: ProfileUpdateProps) => {
	const { user, updateProfile, loading } = useAuthStore();
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
	});
	const [profilePic, setProfilePic] = useState<File | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const submitData = new FormData();
			submitData.append("name", formData.name);
			submitData.append("email", formData.email);
			if (profilePic) {
				submitData.append("profilePic", profilePic);
			}

			await updateProfile(submitData);
			toast.success("Profile updated successfully!");
			onClose();
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
			setProfilePic(e.target.files[0]);
		}
	};

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
				<div className="mt-3">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Update Profile
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={formData.name}
								onChange={handleChange}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div>
							<label
								htmlFor="profilePic"
								className="block text-sm font-medium text-gray-700"
							>
								Profile Picture
							</label>
							<input
								id="profilePic"
								name="profilePic"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div className="flex space-x-3">
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
							>
								{loading ? "Updating..." : "Update Profile"}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ProfileUpdate;
