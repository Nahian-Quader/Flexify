import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
	FiCalendar,
	FiClock,
	FiDollarSign,
	FiCheck,
	FiX,
	FiAlertCircle,
	FiGift,
} from "react-icons/fi";
import { useMembershipStore } from "../store/membershipStore";

const UserSubscriptions = () => {
	const { userSubscriptions, loading, error, fetchUserSubscriptions } =
		useMembershipStore();

	useEffect(() => {
		fetchUserSubscriptions();
	}, [fetchUserSubscriptions]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		return status === "active"
			? "bg-green-100 text-green-800"
			: "bg-red-100 text-red-800";
	};

	const getStatusIcon = (status: string) => {
		return status === "active" ? (
			<FiCheck className="w-4 h-4" />
		) : (
			<FiX className="w-4 h-4" />
		);
	};

	const getDaysRemaining = (endDate: string) => {
		const end = new Date(endDate);
		const now = new Date();
		const diffTime = end.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const activeSubscription = userSubscriptions.find(
		(sub) => sub.status === "active"
	);
	const pastSubscriptions = userSubscriptions.filter(
		(sub) => sub.status === "expired"
	);

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="space-y-3">
						<div className="h-4 bg-gray-200 rounded"></div>
						<div className="h-4 bg-gray-200 rounded w-2/3"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex items-center">
						<FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					My Memberships
				</h2>

				{activeSubscription ? (
					<div className="border border-green-200 rounded-lg p-6 bg-green-50 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-gray-900">
								Current Active Membership
							</h3>
							<div
								className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
									activeSubscription.status
								)}`}
							>
								{getStatusIcon(activeSubscription.status)}
								<span className="ml-1 capitalize">
									{activeSubscription.status}
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
									<FiGift className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Plan
									</p>
									<p className="font-semibold text-gray-900">
										{activeSubscription.membershipPlan.name}
									</p>
								</div>
							</div>

							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
									<FiDollarSign className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Price
									</p>
									<p className="font-semibold text-gray-900">
										$
										{
											activeSubscription.membershipPlan
												.price
										}
									</p>
								</div>
							</div>

							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
									<FiClock className="w-5 h-5 text-purple-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Duration
									</p>
									<p className="font-semibold text-gray-900">
										{
											activeSubscription.membershipPlan
												.durationInMonths
										}{" "}
										months
									</p>
								</div>
							</div>

							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
									<FiCalendar className="w-5 h-5 text-orange-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Days Remaining
									</p>
									<p className="font-semibold text-gray-900">
										{getDaysRemaining(
											activeSubscription.endDate
										)}{" "}
										days
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg p-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Start Date
									</p>
									<p className="font-medium text-gray-900">
										{formatDate(
											activeSubscription.startDate
										)}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600 mb-1">
										End Date
									</p>
									<p className="font-medium text-gray-900">
										{formatDate(activeSubscription.endDate)}
									</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mb-6">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiGift className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No Active Membership
						</h3>
						<p className="text-gray-600 mb-4">
							You don't have any active membership. Choose a plan
							to get started.
						</p>
						<Link
							to="/memberships"
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
						>
							Browse Membership Plans
						</Link>
					</div>
				)}

				{pastSubscriptions.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Subscription History
						</h3>
						<div className="space-y-4">
							{pastSubscriptions.map((subscription) => (
								<div
									key={subscription.id}
									className="border border-gray-200 rounded-lg p-4 bg-gray-50"
								>
									<div className="flex items-center justify-between mb-3">
										<h4 className="font-medium text-gray-900">
											{subscription.membershipPlan.name}
										</h4>
										<div
											className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
												subscription.status
											)}`}
										>
											{getStatusIcon(subscription.status)}
											<span className="ml-1 capitalize">
												{subscription.status}
											</span>
										</div>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div>
											<p className="text-gray-600">
												Duration
											</p>
											<p className="font-medium text-gray-900">
												{
													subscription.membershipPlan
														.durationInMonths
												}{" "}
												months
											</p>
										</div>
										<div>
											<p className="text-gray-600">
												Start Date
											</p>
											<p className="font-medium text-gray-900">
												{formatDate(
													subscription.startDate
												)}
											</p>
										</div>
										<div>
											<p className="text-gray-600">
												End Date
											</p>
											<p className="font-medium text-gray-900">
												{formatDate(
													subscription.endDate
												)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="mt-6 flex flex-col sm:flex-row gap-4">
					<Link
						to="/memberships"
						className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
					>
						{activeSubscription
							? "Renew or Change Plan"
							: "Choose a Plan"}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default UserSubscriptions;
