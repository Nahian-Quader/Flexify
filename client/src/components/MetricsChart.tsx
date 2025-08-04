import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";
import { useState } from "react";
import { FiTrendingUp, FiBarChart } from "react-icons/fi";
import type { MetricsData } from "../store/metricsStore";

interface MetricsChartProps {
	metrics: MetricsData[];
	selectedMetric: string;
}

const MetricsChart = ({ metrics, selectedMetric }: MetricsChartProps) => {
	const [chartType, setChartType] = useState<"line" | "bar">("line");

	const chartData = metrics
		.filter(
			(metric) =>
				metric[selectedMetric as keyof MetricsData] !== undefined
		)
		.map((metric) => ({
			date: new Date(metric.date).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
			value: metric[selectedMetric as keyof MetricsData] as number,
			fullDate: new Date(metric.date).toLocaleDateString(),
		}))
		.reverse();

	const getMetricUnit = (metric: string) => {
		switch (metric) {
			case "weight":
			case "muscleMass":
				return "kg";
			case "bodyFat":
				return "%";
			case "waist":
			case "chest":
			case "hips":
			case "biceps":
			case "thighs":
			case "height":
				return "cm";
			default:
				return "";
		}
	};

	const getMetricLabel = (metric: string) => {
		switch (metric) {
			case "bodyFat":
				return "Body Fat";
			case "muscleMass":
				return "Muscle Mass";
			default:
				return metric.charAt(0).toUpperCase() + metric.slice(1);
		}
	};

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
					<p className="text-sm text-gray-600">{`Date: ${payload[0].payload.fullDate}`}</p>
					<p className="text-sm font-medium text-blue-600">
						{`${getMetricLabel(selectedMetric)}: ${
							payload[0].value
						} ${getMetricUnit(selectedMetric)}`}
					</p>
				</div>
			);
		}
		return null;
	};

	if (chartData.length === 0) {
		return (
			<div className="h-64 flex items-center justify-center text-gray-500">
				<div className="text-center">
					<FiTrendingUp className="w-12 h-12 mx-auto mb-2" />
					<p>
						No data available for {getMetricLabel(selectedMetric)}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-medium text-gray-900">
					{getMetricLabel(selectedMetric)} Progress
				</h3>
				<div className="flex items-center space-x-2">
					<button
						onClick={() => setChartType("line")}
						className={`p-2 rounded-lg transition-colors ${
							chartType === "line"
								? "bg-blue-100 text-blue-600"
								: "text-gray-600 hover:bg-gray-100"
						}`}
						title="Line chart"
					>
						<FiTrendingUp className="w-4 h-4" />
					</button>
					<button
						onClick={() => setChartType("bar")}
						className={`p-2 rounded-lg transition-colors ${
							chartType === "bar"
								? "bg-blue-100 text-blue-600"
								: "text-gray-600 hover:bg-gray-100"
						}`}
						title="Bar chart"
					>
						<FiBarChart className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					{chartType === "line" ? (
						<LineChart data={chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#f0f0f0"
							/>
							<XAxis
								dataKey="date"
								stroke="#6b7280"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="#6b7280"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								domain={["dataMin - 5", "dataMax + 5"]}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="value"
								stroke="#2563eb"
								strokeWidth={2}
								dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
								activeDot={{
									r: 6,
									stroke: "#2563eb",
									strokeWidth: 2,
								}}
							/>
						</LineChart>
					) : (
						<BarChart data={chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#f0f0f0"
							/>
							<XAxis
								dataKey="date"
								stroke="#6b7280"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="#6b7280"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								domain={["dataMin - 5", "dataMax + 5"]}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar
								dataKey="value"
								fill="#2563eb"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					)}
				</ResponsiveContainer>
			</div>

			<div className="mt-4 text-center text-sm text-gray-600">
				{chartData.length} data points •{" "}
				{getMetricLabel(selectedMetric)} in{" "}
				{getMetricUnit(selectedMetric)}
			</div>
		</div>
	);
};

export default MetricsChart;
