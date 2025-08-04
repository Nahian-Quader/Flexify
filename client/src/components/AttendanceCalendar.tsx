import { useState } from "react";
import { FiX, FiCalendar, FiCheck } from "react-icons/fi";

interface AttendanceCalendarProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	userName: string;
	userAttendanceData: any[];
}

const AttendanceCalendar = ({
	isOpen,
	onClose,
	userName,
	userAttendanceData,
}: AttendanceCalendarProps) => {
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (month: number, year: number) => {
		return new Date(year, month, 1).getDay();
	};

	const hasAttendanceOnDate = (day: number) => {
		const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
			2,
			"0"
		)}-${String(day).padStart(2, "0")}`;
		return userAttendanceData.some((record) => {
			const recordDate = new Date(record.date)
				.toISOString()
				.split("T")[0];
			return recordDate === dateStr;
		});
	};

	const getAttendanceForDate = (day: number) => {
		const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
			2,
			"0"
		)}-${String(day).padStart(2, "0")}`;
		return userAttendanceData.find((record) => {
			const recordDate = new Date(record.date)
				.toISOString()
				.split("T")[0];
			return recordDate === dateStr;
		});
	};

	const renderCalendar = () => {
		const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
		const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
		const days = [];

		// Empty cells for days before the first day of the month
		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className="h-12 w-12"></div>);
		}

		// Days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const hasAttendance = hasAttendanceOnDate(day);
			const attendanceRecord = getAttendanceForDate(day);
			const isToday =
				new Date().toDateString() ===
				new Date(selectedYear, selectedMonth, day).toDateString();

			days.push(
				<div
					key={day}
					className={`h-12 w-12 flex items-center justify-center text-sm font-medium rounded-lg border relative ${
						isToday
							? "border-blue-500 bg-blue-50 text-blue-700"
							: "border-gray-200"
					} ${
						hasAttendance
							? "bg-green-100 text-green-800 border-green-300"
							: "hover:bg-gray-50"
					}`}
					title={
						attendanceRecord
							? `Check-in: ${new Date(
									attendanceRecord.checkInTime
							  ).toLocaleTimeString()}`
							: "No attendance"
					}
				>
					<span>{day}</span>
					{hasAttendance && (
						<FiCheck className="absolute top-1 right-1 w-3 h-3 text-green-600" />
					)}
				</div>
			);
		}

		return days;
	};

	const totalAttendanceDays = userAttendanceData.length;
	const currentMonthAttendance = userAttendanceData.filter((record) => {
		const recordDate = new Date(record.date);
		return (
			recordDate.getMonth() === selectedMonth &&
			recordDate.getFullYear() === selectedYear
		);
	}).length;

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 flex items-center">
							<FiCalendar className="mr-2" />
							Attendance Calendar
						</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							title="Close calendar"
						>
							<FiX className="w-6 h-6" />
						</button>
					</div>

					<div className="mb-4">
						<h3 className="font-semibold text-gray-900 mb-2">
							{userName}
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="bg-blue-50 p-3 rounded-lg">
								<div className="font-medium text-blue-900">
									Total Days
								</div>
								<div className="text-2xl font-bold text-blue-700">
									{totalAttendanceDays}
								</div>
							</div>
							<div className="bg-green-50 p-3 rounded-lg">
								<div className="font-medium text-green-900">
									This Month
								</div>
								<div className="text-2xl font-bold text-green-700">
									{currentMonthAttendance}
								</div>
							</div>
						</div>
					</div>

					<div className="mb-4">
						<div className="flex items-center justify-between mb-4">
							<select
								value={selectedMonth}
								onChange={(e) =>
									setSelectedMonth(Number(e.target.value))
								}
								className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								title="Select month"
							>
								{monthNames.map((month, index) => (
									<option key={index} value={index}>
										{month}
									</option>
								))}
							</select>
							<select
								value={selectedYear}
								onChange={(e) =>
									setSelectedYear(Number(e.target.value))
								}
								className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								title="Select year"
							>
								{Array.from(
									{ length: 5 },
									(_, i) => new Date().getFullYear() - 2 + i
								).map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>

						<div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
							<div>Sun</div>
							<div>Mon</div>
							<div>Tue</div>
							<div>Wed</div>
							<div>Thu</div>
							<div>Fri</div>
							<div>Sat</div>
						</div>

						<div className="grid grid-cols-7 gap-1">
							{renderCalendar()}
						</div>
					</div>

					<div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
							<span>Attended</span>
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-blue-50 border border-blue-500 rounded mr-2"></div>
							<span>Today</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AttendanceCalendar;
