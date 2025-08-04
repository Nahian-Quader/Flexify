import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	FiPlus,
	FiTrendingUp,
	FiActivity,
	FiCalendar,
	FiEdit3,
	FiTrash2,
	FiTarget,
	FiSliders,
	FiBarChart,
	FiAward,
} from "react-icons/fi";
import { useMetricsStore } from "../store/metricsStore";
import MetricsChart from "../components/MetricsChart";
import MetricsForm from "../components/MetricsForm";
import { useAuthStore } from "../store/authStore";

const Progress = () => {
	const { user } = useAuthStore();
	const { metrics, loading, error, fetchMetrics, deleteMetrics, clearError } =
		useMetricsStore();
	const [showForm, setShowForm] = useState(false);
	const [editingMetrics, setEditingMetrics] = useState(null);
	const [selectedMetric, setSelectedMetric] = useState("weight");
	const [dateFilter, setDateFilter] = useState("all"); // all, month, week

	const getFilteredMetrics = () => {
		if (dateFilter === "all") return metrics;

		const now = new Date();
		const cutoffDate = new Date();

		if (dateFilter === "week") {
			cutoffDate.setDate(now.getDate() - 7);
		} else if (dateFilter === "month") {
			cutoffDate.setDate(now.getDate() - 30);
		}

		return metrics.filter((metric) => new Date(metric.date) >= cutoffDate);
	};

	const filteredMetrics = getFilteredMetrics();

	useEffect(() => {
		fetchMetrics();
	}, [fetchMetrics]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const getProgressStats = () => {
		if (metrics.length < 2) return null;

		const sortedMetrics = [...metrics].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);
		const latest = sortedMetrics[sortedMetrics.length - 1];
		const previous = sortedMetrics[sortedMetrics.length - 2];

		const weightChange = latest.weight - previous.weight;
		const bodyFatChange =
			latest.bodyFat && previous.bodyFat
				? latest.bodyFat - previous.bodyFat
				: null;
		const muscleMassChange =
			latest.muscleMass && previous.muscleMass
				? latest.muscleMass - previous.muscleMass
				: null;

		return {
			weightChange,
			bodyFatChange,
			muscleMassChange,
			totalEntries: metrics.length,
			daysSince: Math.floor(
				(new Date(latest.date).getTime() -
					new Date(sortedMetrics[0].date).getTime()) /
					(1000 * 60 * 60 * 24)
			),
		};
	};

	const progressStats = getProgressStats();

	useEffect(() => {
		fetchMetrics();
	}, [fetchMetrics]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const handleDelete = async (id: string) => {
		if (
			window.confirm(
				"Are you sure you want to delete this metrics entry?"
			)
		) {
			try {
				await deleteMetrics(id);
				toast.success("Metrics entry deleted successfully");
			} catch (error) {
				toast.error("Failed to delete metrics entry");
			}
		}
	};

	const handleEdit = (metric: any) => {
		setEditingMetrics(metric);
		setShowForm(true);
	};

	const handleFormClose = () => {
		setShowForm(false);
		setEditingMetrics(null);
	};

	const getMetricIcon = (metric: string) => {
		switch (metric) {
			case "weight":
				return <FiTrendingUp className="w-4 h-4" />;
			case "bodyFat":
				return <FiTarget className="w-4 h-4" />;
			case "muscleMass":
				return <FiActivity className="w-4 h-4" />;
			case "waist":
			case "chest":
			case "hips":
			case "biceps":
			case "thighs":
				return <FiSliders className="w-4 h-4" />;
			case "height":
				return <FiSliders className="w-4 h-4" />;
			default:
				return <FiTrendingUp className="w-4 h-4" />;
		}
	};

	const formatMetricValue = (value: number | undefined, metric: string) => {
		if (value === undefined) return "N/A";

		switch (metric) {
			case "weight":
			case "muscleMass":
				return `${value} kg`;
			case "bodyFat":
				return `${value}%`;
			case "waist":
			case "chest":
			case "hips":
			case "biceps":
			case "thighs":
			case "height":
				return `${value} cm`;
			default:
				return value.toString();
		}
	};

	const availableMetrics = [
		{ key: "weight", label: "Weight" },
		{ key: "bodyFat", label: "Body Fat %" },
		{ key: "muscleMass", label: "Muscle Mass" },
		{ key: "waist", label: "Waist" },
		{ key: "chest", label: "Chest" },
		{ key: "hips", label: "Hips" },
		{ key: "biceps", label: "Biceps" },
		{ key: "thighs", label: "Thighs" },
		{ key: "height", label: "Height" },
	];

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Please log in
					</h1>
					<p className="text-gray-600">
						You need to be logged in to view your progress.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center">
								<FiTrendingUp className="w-8 h-8 mr-3 text-blue-600" />
								Progress Tracking
							</h1>
							<p className="mt-2 text-lg text-gray-600">
								Track your fitness journey and body metrics
							</p>
						</div>
						<div className="flex items-center space-x-3">
							<button
								onClick={() => setShowForm(true)}
								className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
							>
								<FiPlus className="w-5 h-5 mr-2" />
								Add Entry
							</button>
						</div>
					</div>
				</div>

				{progressStats && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-blue-100 rounded-lg">
									<FiBarChart className="w-6 h-6 text-blue-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Total Entries
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{progressStats.totalEntries}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-green-100 rounded-lg">
									<FiTrendingUp className="w-6 h-6 text-green-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Weight Change
									</p>
									<p
										className={`text-2xl font-bold ${
											progressStats.weightChange >= 0
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{progressStats.weightChange > 0
											? "+"
											: ""}
										{progressStats.weightChange.toFixed(1)}{" "}
										kg
									</p>
								</div>
							</div>
						</div>

						{progressStats.bodyFatChange !== null && (
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
								<div className="flex items-center">
									<div className="p-2 bg-purple-100 rounded-lg">
										<FiTarget className="w-6 h-6 text-purple-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">
											Body Fat Change
										</p>
										<p
											className={`text-2xl font-bold ${
												progressStats.bodyFatChange <= 0
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{progressStats.bodyFatChange > 0
												? "+"
												: ""}
											{progressStats.bodyFatChange.toFixed(
												1
											)}
											%
										</p>
									</div>
								</div>
							</div>
						)}

						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<div className="flex items-center">
								<div className="p-2 bg-orange-100 rounded-lg">
									<FiAward className="w-6 h-6 text-orange-600" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Tracking Days
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{progressStats.daysSince}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{metrics.length > 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-gray-900 flex items-center">
								<FiActivity className="w-6 h-6 mr-2 text-blue-600" />
								Progress Chart
							</h2>
							<select
								value={selectedMetric}
								onChange={(e) =>
									setSelectedMetric(e.target.value)
								}
								className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								title="Select metric to display"
							>
								{availableMetrics.map((metric) => (
									<option key={metric.key} value={metric.key}>
										{metric.label}
									</option>
								))}
							</select>
						</div>
						<MetricsChart
							metrics={filteredMetrics}
							selectedMetric={selectedMetric}
						/>
					</div>
				)}

				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900 flex items-center">
								<FiCalendar className="w-6 h-6 mr-2 text-blue-600" />
								Metrics History
							</h2>
							<div className="flex items-center space-x-2">
								<select
									value={dateFilter}
									onChange={(e) =>
										setDateFilter(e.target.value)
									}
									className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									title="Filter metrics by date range"
								>
									<option value="all">All Time</option>
									<option value="month">Last 30 Days</option>
									<option value="week">Last 7 Days</option>
								</select>
							</div>
						</div>
					</div>

					{loading ? (
						<div className="p-8 text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-2 text-gray-600">
								Loading metrics...
							</p>
						</div>
					) : filteredMetrics.length === 0 ? (
						<div className="p-8 text-center">
							<FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{dateFilter === "all"
									? "No metrics recorded yet"
									: `No metrics found for ${
											dateFilter === "week"
												? "last 7 days"
												: "last 30 days"
									  }`}
							</h3>
							<p className="text-gray-600 mb-4">
								{dateFilter === "all"
									? "Start tracking your progress by adding your first entry."
									: "Try selecting a different time range or add new entries."}
							</p>
							<button
								onClick={() => setShowForm(true)}
								className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
							>
								Add Entry
							</button>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{filteredMetrics.map((metric) => (
								<div
									key={metric.id}
									className="p-6 hover:bg-gray-50 transition-colors"
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center mb-3">
												<FiCalendar className="w-5 h-5 text-gray-400 mr-2" />
												<span className="text-lg font-medium text-gray-900">
													{new Date(
														metric.date
													).toLocaleDateString(
														"en-US",
														{
															weekday: "long",
															year: "numeric",
															month: "long",
															day: "numeric",
														}
													)}
												</span>
											</div>
											<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
												{availableMetrics.map(
													({ key, label }) => {
														const value =
															metric[
																key as keyof typeof metric
															];
														if (
															value ===
																undefined ||
															value === null
														)
															return null;

														return (
															<div
																key={key}
																className="flex items-center"
															>
																{getMetricIcon(
																	key
																)}
																<div className="ml-2">
																	<p className="text-sm text-gray-500">
																		{label}
																	</p>
																	<p className="font-medium text-gray-900">
																		{formatMetricValue(
																			value as number,
																			key
																		)}
																	</p>
																</div>
															</div>
														);
													}
												)}
											</div>
										</div>
										<div className="flex items-center space-x-2 ml-6">
											<button
												onClick={() =>
													handleEdit(metric)
												}
												className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
												title="Edit metrics entry"
											>
												<FiEdit3 className="w-4 h-4" />
											</button>
											<button
												onClick={() =>
													handleDelete(metric.id)
												}
												className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
												title="Delete metrics entry"
											>
												<FiTrash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>

			{showForm && (
				<MetricsForm
					metrics={editingMetrics}
					onClose={handleFormClose}
					onSuccess={() => {
						handleFormClose();
						fetchMetrics();
					}}
				/>
			)}
		</div>
	);
};

export default Progress;
