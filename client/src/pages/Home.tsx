import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
	FiUser,
	FiUsers,
	FiShield,
	FiArrowRight,
	FiCheckCircle,
} from "react-icons/fi";

const Home = () => {
	const { isAuthenticated, user } = useAuthStore();

	const features = [
		{
			icon: <FiUser className="w-8 h-8" />,
			title: "Member Management",
			description: "Easy member registration and profile management",
		},
		{
			icon: <FiUsers className="w-8 h-8" />,
			title: "Trainer Support",
			description: "Comprehensive trainer tools and member interaction",
		},
		{
			icon: <FiShield className="w-8 h-8" />,
			title: "Admin Control",
			description: "Full administrative control and user management",
		},
	];

	const benefits = [
		"Easy user registration and authentication",
		"Role-based access control",
		"Profile management with photo uploads",
		"Clean and modern interface",
		"Secure data handling",
		"Mobile-responsive design",
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Hero Section */}
			<div className="relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
					<div className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
							Welcome to{" "}
							<span className="text-blue-600">Flexify</span>
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
							Your complete gym management solution with powerful
							authentication and role-based access control
						</p>

						{isAuthenticated ? (
							<div className="space-y-4">
								<p className="text-lg text-gray-700">
									Welcome back,{" "}
									<span className="font-semibold">
										{user?.name}
									</span>
									!
								</p>
								<Link
									to={
										user?.role === "admin"
											? "/admin"
											: user?.role === "trainer"
											? "/trainer"
											: "/dashboard"
									}
									className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
								>
									Go to Dashboard
									<FiArrowRight className="ml-2 w-5 h-5" />
								</Link>
							</div>
						) : (
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link
									to="/register"
									className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
								>
									Get Started
									<FiArrowRight className="ml-2 w-5 h-5" />
								</Link>
								<Link
									to="/login"
									className="inline-flex items-center px-8 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
								>
									Sign In
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Powerful Features
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Everything you need to manage your gym with
							different user roles and permissions
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<div
								key={index}
								className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200"
							>
								<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
									{feature.icon}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-600">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Benefits Section */}
			<div className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Why Choose Flexify?
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								Built with modern technologies and best
								practices to provide a secure, scalable, and
								user-friendly gym management experience.
							</p>
							<div className="space-y-4">
								{benefits.map((benefit, index) => (
									<div
										key={index}
										className="flex items-center"
									>
										<FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
										<span className="text-gray-700">
											{benefit}
										</span>
									</div>
								))}
							</div>
						</div>
						<div className="lg:text-center">
							<div className="inline-block p-8 bg-white rounded-2xl shadow-xl">
								<div className="text-center space-y-6">
									<div className="flex justify-center space-x-4">
										<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
											<FiShield className="w-6 h-6 text-red-600" />
										</div>
										<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
											<FiUsers className="w-6 h-6 text-blue-600" />
										</div>
										<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
											<FiUser className="w-6 h-6 text-green-600" />
										</div>
									</div>
									<div>
										<h3 className="text-xl font-semibold text-gray-900 mb-2">
											Role-Based Access
										</h3>
										<p className="text-gray-600">
											Admin, Trainer, and Member roles
											with appropriate permissions and
											features
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			{!isAuthenticated && (
				<div className="py-16 bg-blue-600">
					<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
						<h2 className="text-3xl font-bold text-white mb-4">
							Ready to Get Started?
						</h2>
						<p className="text-xl text-blue-100 mb-8">
							Join Flexify today and experience the future of gym
							management
						</p>
						<Link
							to="/register"
							className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
						>
							Create Your Account
							<FiArrowRight className="ml-2 w-5 h-5" />
						</Link>
					</div>
				</div>
			)}
		</div>
	);
};

export default Home;
