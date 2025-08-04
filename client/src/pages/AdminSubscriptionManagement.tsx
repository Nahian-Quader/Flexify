import { useEffect, useState } from "react";
import {
	FiUsers,
	FiFilter,
	FiCalendar,
	FiDollarSign,
	FiClock,
	FiCheck,
	FiX,
	FiUser,
} from "react-icons/fi";
import { useMembershipStore } from "../store/membershipStore";

const AdminSubscriptionManagement = () => {
	const { adminSubscriptions, loading, error, fetchAdminSubscriptions } =
		useMembershipStore();
	const [statusFilter, setStatusFilter] = useState<
		"all" | "active" | "expired"
	>("all");

	useEffect(() => {
		if (statusFilter === "all") {
			fetchAdminSubscriptions();
		} else {
			fetchAdminSubscriptions(statusFilter);
		}
	}, [statusFilter, fetchAdminSubscriptions]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
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

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "trainer":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-green-100 text-green-800";
		}
	};

	const getDaysRemaining = (endDate: string) => {
		const end = new Date(endDate);
		const now = new Date();
		const diffTime = end.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const activeCount = adminSubscriptions.filter(
		(sub) => sub.status === "active"
	).length;
	const expiredCount = adminSubscriptions.filter(
		(sub) => sub.status === "expired"
	).length;

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						User Subscriptions
					</h2>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<FiFilter className="w-4 h-4 text-gray-500" />
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(
										e.target.value as
											| "all"
											| "active"
											| "expired"
									)
								}
								className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								aria-label="Filter subscriptions by status"
							>
								<option value="all">All Status</option>
								<option value="active">Active Only</option>
								<option value="expired">Expired Only</option>
							</select>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-blue-50 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600">
									Total Subscriptions
								</p>
								<p className="text-2xl font-bold text-blue-900">
									{adminSubscriptions.length}
								</p>
							</div>
							<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
								<FiUsers className="w-5 h-5 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-green-50 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600">
									Active
								</p>
								<p className="text-2xl font-bold text-green-900">
									{activeCount}
								</p>
							</div>
							<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
								<FiCheck className="w-5 h-5 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-red-50 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-red-600">
									Expired
								</p>
								<p className="text-2xl font-bold text-red-900">
									{expiredCount}
								</p>
							</div>
							<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
								<FiX className="w-5 h-5 text-red-600" />
							</div>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
						<p className="text-red-600">{error}</p>
					</div>
				)}

				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">
							Loading subscriptions...
						</p>
					</div>
				) : adminSubscriptions.length === 0 ? (
					<div className="text-center py-8">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiUsers className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No subscriptions found
						</h3>
						<p className="text-gray-600">
							{statusFilter === "all"
								? "No users have subscriptions yet."
								: `No ${statusFilter} subscriptions found.`}
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
										Plan
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Duration
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Start Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										End Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{adminSubscriptions.map((subscription) => (
									<tr
										key={subscription.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
													<FiUser className="w-5 h-5 text-blue-600" />
												</div>
												<div>
													<div className="text-sm font-medium text-gray-900">
														{subscription.user.name}
													</div>
													<div className="text-sm text-gray-500">
														{
															subscription.user
																.email
														}
													</div>
													<div className="mt-1">
														<span
															className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(
																subscription
																	.user.role
															)}`}
														>
															{
																subscription
																	.user.role
															}
														</span>
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{
													subscription.membershipPlan
														.name
												}
											</div>
											{subscription.membershipPlan
												.description && (
												<div className="text-sm text-gray-500">
													{
														subscription
															.membershipPlan
															.description
													}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center text-sm text-gray-900">
												<FiClock className="w-4 h-4 mr-2 text-gray-500" />
												{
													subscription.membershipPlan
														.durationInMonths
												}{" "}
												months
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center text-sm text-gray-900">
												<FiDollarSign className="w-4 h-4 mr-1 text-gray-500" />
												{
													subscription.membershipPlan
														.price
												}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center text-sm text-gray-900">
												<FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
												{formatDate(
													subscription.startDate
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatDate(
													subscription.endDate
												)}
											</div>
											{subscription.status ===
												"active" && (
												<div className="text-xs text-gray-500">
													{getDaysRemaining(
														subscription.endDate
													)}{" "}
													days left
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
													subscription.status
												)}`}
											>
												{getStatusIcon(
													subscription.status
												)}
												<span className="ml-1 capitalize">
													{subscription.status}
												</span>
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminSubscriptionManagement;
