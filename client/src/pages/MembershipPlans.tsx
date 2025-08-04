import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
	FiClock,
	FiDollarSign,
	FiCheck,
	FiStar,
	FiGift,
	FiZap,
} from "react-icons/fi";
import { useMembershipStore } from "../store/membershipStore";
import { useAuthStore } from "../store/authStore";

const MembershipPlans = () => {
	const navigate = useNavigate();
	const {
		plans,
		loading,
		error,
		fetchPlans,
		createSubscription,
		userSubscriptions,
		fetchUserSubscriptions,
	} = useMembershipStore();
	const { isAuthenticated, user } = useAuthStore();
	const [subscribingTo, setSubscribingTo] = useState<string | null>(null);

	useEffect(() => {
		// Redirect trainers and admins to their respective dashboards
		if (
			isAuthenticated &&
			user &&
			(user.role === "trainer" || user.role === "admin")
		) {
			toast.error("Subscription features are only available for members");
			if (user.role === "admin") {
				navigate("/admin");
			} else if (user.role === "trainer") {
				navigate("/trainer");
			}
			return;
		}

		fetchPlans();

		// Fetch user subscriptions if authenticated and is a member
		if (isAuthenticated && user && user.role === "member") {
			fetchUserSubscriptions();
		}
	}, [fetchPlans, fetchUserSubscriptions, isAuthenticated, user, navigate]);

	const handleSubscribe = async (planId: string) => {
		if (!isAuthenticated) {
			toast.error("Please login to subscribe to a membership plan");
			navigate("/login");
			return;
		}

		setSubscribingTo(planId);
		try {
			// Check if user has active subscription for dynamic messaging
			const hasActiveSubscription = userSubscriptions.some(
				(sub) => sub.status === "active"
			);

			await createSubscription(planId);

			if (hasActiveSubscription) {
				toast.success("Successfully changed your membership plan!");
			} else {
				toast.success("Successfully subscribed to membership plan!");
			}
			navigate("/dashboard");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to subscribe"
			);
		} finally {
			setSubscribingTo(null);
		}
	};

	const getPlanIcon = (name: string) => {
		const planName = name.toLowerCase();
		if (planName.includes("basic")) return <FiGift className="w-8 h-8" />;
		if (planName.includes("premium") || planName.includes("pro"))
			return <FiStar className="w-8 h-8" />;
		if (planName.includes("elite") || planName.includes("ultimate"))
			return <FiZap className="w-8 h-8" />;
		return <FiCheck className="w-8 h-8" />;
	};

	const getPlanColor = (name: string) => {
		const planName = name.toLowerCase();
		if (planName.includes("basic")) return "from-green-500 to-green-600";
		if (planName.includes("premium") || planName.includes("pro"))
			return "from-blue-500 to-blue-600";
		if (planName.includes("elite") || planName.includes("ultimate"))
			return "from-purple-500 to-purple-600";
		return "from-gray-500 to-gray-600";
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">
						Loading membership plans...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						{isAuthenticated &&
						user?.role === "member" &&
						userSubscriptions.some((sub) => sub.status === "active")
							? "Change Your Membership Plan"
							: "Choose Your Membership Plan"}
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						{isAuthenticated &&
						user?.role === "member" &&
						userSubscriptions.some((sub) => sub.status === "active")
							? "Switch to a different plan anytime. Your current plan will be replaced immediately."
							: "Select the perfect membership plan that fits your fitness goals and budget. All plans include access to our state-of-the-art facilities."}
					</p>
				</div>

				{error && (
					<div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
						<p className="text-red-600">{error}</p>
					</div>
				)}

				{plans.length === 0 && !loading ? (
					<div className="text-center py-12">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiGift className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No membership plans available
						</h3>
						<p className="text-gray-600">
							Please check back later for available membership
							plans.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{plans.map((plan) => {
							const isCurrentPlan =
								isAuthenticated &&
								user?.role === "member" &&
								userSubscriptions.some(
									(sub) =>
										sub.status === "active" &&
										sub.membershipPlan.id === plan.id
								);

							return (
								<div
									key={plan.id}
									className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
										isCurrentPlan
											? "ring-2 ring-blue-500 ring-offset-2"
											: ""
									}`}
								>
									<div
										className={`bg-gradient-to-r ${getPlanColor(
											plan.name
										)} p-6 text-white relative`}
									>
										{isCurrentPlan && (
											<div className="absolute top-4 right-4">
												<span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
													Current Plan
												</span>
											</div>
										)}
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center space-x-3">
												{getPlanIcon(plan.name)}
												<h3 className="text-2xl font-bold">
													{plan.name}
												</h3>
											</div>
										</div>
										<div className="flex items-baseline">
											<span className="text-4xl font-bold">
												${plan.price}
											</span>
											<span className="text-lg ml-2 opacity-90">
												/{plan.durationInMonths} month
												{plan.durationInMonths !== 1
													? "s"
													: ""}
											</span>
										</div>
									</div>

									<div className="p-6">
										<div className="flex items-center text-gray-600 mb-4">
											<FiClock className="w-5 h-5 mr-2" />
											<span>
												{plan.durationInMonths} month
												{plan.durationInMonths !== 1
													? "s"
													: ""}{" "}
												duration
											</span>
										</div>

										<div className="flex items-center text-gray-600 mb-6">
											<FiDollarSign className="w-5 h-5 mr-2" />
											<span>
												$
												{(
													plan.price /
													plan.durationInMonths
												).toFixed(2)}{" "}
												per month
											</span>
										</div>

										{plan.description && (
											<div className="mb-6">
												<p className="text-gray-700 leading-relaxed">
													{plan.description}
												</p>
											</div>
										)}

										<div className="space-y-3 mb-6">
											<div className="flex items-center text-green-600">
												<FiCheck className="w-5 h-5 mr-3" />
												<span>
													Access to all gym equipment
												</span>
											</div>
											<div className="flex items-center text-green-600">
												<FiCheck className="w-5 h-5 mr-3" />
												<span>Locker room access</span>
											</div>
											<div className="flex items-center text-green-600">
												<FiCheck className="w-5 h-5 mr-3" />
												<span>Free WiFi</span>
											</div>
											{plan.durationInMonths >= 6 && (
												<div className="flex items-center text-green-600">
													<FiCheck className="w-5 h-5 mr-3" />
													<span>
														Personal trainer
														consultation
													</span>
												</div>
											)}
											{plan.durationInMonths >= 12 && (
												<div className="flex items-center text-green-600">
													<FiCheck className="w-5 h-5 mr-3" />
													<span>
														Nutrition guidance
													</span>
												</div>
											)}
										</div>

										{(!isAuthenticated ||
											user?.role === "member") && (
											<button
												onClick={() =>
													handleSubscribe(plan.id)
												}
												disabled={
													subscribingTo === plan.id
												}
												className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
													subscribingTo === plan.id
														? "bg-gray-400 cursor-not-allowed"
														: `bg-gradient-to-r ${getPlanColor(
																plan.name
														  )} hover:opacity-90`
												} text-white`}
											>
												{subscribingTo === plan.id ? (
													<div className="flex items-center justify-center">
														<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
														{userSubscriptions.some(
															(sub) =>
																sub.status ===
																"active"
														)
															? "Changing Plan..."
															: "Subscribing..."}
													</div>
												) : userSubscriptions.some(
														(sub) =>
															sub.status ===
															"active"
												  ) ? (
													"Change to This Plan"
												) : (
													"Choose This Plan"
												)}
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{isAuthenticated && user?.role === "member" && (
					<div className="mt-12 text-center">
						<button
							onClick={() => navigate("/dashboard")}
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
						>
							View My Subscriptions
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default MembershipPlans;
