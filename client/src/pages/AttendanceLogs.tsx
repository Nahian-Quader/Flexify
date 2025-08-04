import { useState, useEffect } from "react";
import {
	FiCalendar,
	FiUsers,
	FiRefreshCw,
	FiClock,
	FiUser,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAttendanceStore } from "../store/attendanceStore";

const AttendanceLogs = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedUserId, setSelectedUserId] = useState("");
	const [userSearchTerm, setUserSearchTerm] = useState("");

	const { attendanceRecords, loading, error, getAttendanceLogs, clearError } =
		useAttendanceStore();

	useEffect(() => {
		const today = new Date();
		const sevenDaysAgo = new Date(
			today.getTime() - 7 * 24 * 60 * 60 * 1000
		);

		setStartDate(sevenDaysAgo.toISOString().split("T")[0]);
		setEndDate(today.toISOString().split("T")[0]);

		getAttendanceLogs({
			startDate: sevenDaysAgo.toISOString().split("T")[0],
			endDate: today.toISOString().split("T")[0],
		});
	}, [getAttendanceLogs]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const handleFilterChange = () => {
		const filters: any = {};
		if (startDate) filters.startDate = startDate;
		if (endDate) filters.endDate = endDate;
		if (selectedUserId) filters.userId = selectedUserId;

		getAttendanceLogs(filters);
	};

	const handleRefresh = () => {
		handleFilterChange();
		toast.success("Attendance logs refreshed!");
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const uniqueUsers = Array.from(
		new Map(
			attendanceRecords.map((record) => [record.user.id, record.user])
		).values()
	);

	const filteredUsers = uniqueUsers.filter((user) =>
		user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md">
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-2xl font-bold text-gray-900 flex items-center">
								<FiUsers className="mr-3" />
								Attendance Logs
							</h1>
							<button
								onClick={handleRefresh}
								disabled={loading}
								className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
							>
								<FiRefreshCw
									className={`mr-2 ${
										loading ? "animate-spin" : ""
									}`}
								/>
								Refresh
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<FiCalendar className="inline mr-1" />
									Start Date
								</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) =>
										setStartDate(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									aria-label="Start date"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<FiCalendar className="inline mr-1" />
									End Date
								</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									aria-label="End date"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<FiUser className="inline mr-1" />
									Filter by User
								</label>
								<div className="relative">
									<input
										type="text"
										value={userSearchTerm}
										onChange={(e) =>
											setUserSearchTerm(e.target.value)
										}
										placeholder="Search users..."
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									{userSearchTerm && (
										<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
											{filteredUsers.map((user) => (
												<button
													key={user.id}
													onClick={() => {
														setSelectedUserId(
															user.id
														);
														setUserSearchTerm(
															user.name
														);
													}}
													className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
												>
													{user.name}
												</button>
											))}
											{filteredUsers.length === 0 && (
												<div className="px-3 py-2 text-gray-500">
													No users found
												</div>
											)}
										</div>
									)}
								</div>
							</div>

							<div className="flex items-end">
								<button
									onClick={handleFilterChange}
									disabled={loading}
									className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
								>
									Apply Filters
								</button>
							</div>
						</div>

						{selectedUserId && (
							<div className="mt-4 flex items-center">
								<span className="text-sm text-gray-600 mr-2">
									Filtered by:
								</span>
								<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
									{userSearchTerm}
								</span>
								<button
									onClick={() => {
										setSelectedUserId("");
										setUserSearchTerm("");
										handleFilterChange();
									}}
									className="text-red-600 hover:text-red-800 text-sm"
								>
									Clear
								</button>
							</div>
						)}
					</div>

					<div className="p-6">
						{loading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-2 text-gray-600">
									Loading attendance logs...
								</p>
							</div>
						) : attendanceRecords.length === 0 ? (
							<div className="text-center py-8">
								<FiUsers className="mx-auto h-12 w-12 text-gray-400" />
								<p className="mt-2 text-gray-600">
									No attendance records found
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
												Date
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Check In
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Check Out
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Duration
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Status
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{attendanceRecords.map((record) => (
											<tr
												key={record.id}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center">
														{record.user
															.profilePic ? (
															<img
																src={`http://localhost:5000${record.user.profilePic}`}
																alt={
																	record.user
																		.name
																}
																className="h-8 w-8 rounded-full mr-3"
															/>
														) : (
															<div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
																<FiUser className="text-gray-600" />
															</div>
														)}
														<div>
															<div className="text-sm font-medium text-gray-900">
																{
																	record.user
																		.name
																}
															</div>
															<div className="text-sm text-gray-500">
																{
																	record.user
																		.email
																}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{formatDate(record.date)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													<div className="flex items-center">
														<FiClock className="mr-1 text-green-600" />
														{formatTime(
															record.checkInTime
														)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{attendanceRecords.length > 0 && (
							<div className="mt-4 text-sm text-gray-600">
								Showing {attendanceRecords.length} attendance
								record(s)
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AttendanceLogs;
