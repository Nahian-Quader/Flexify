import { useState } from "react";
import {
	FiBell,
	FiClock,
	FiToggleLeft,
	FiToggleRight,
	FiX,
} from "react-icons/fi";

interface RemindersSettingsProps {
	onClose: () => void;
}

interface ReminderSettings {
	enabled: boolean;
	frequency: "daily" | "weekly";
	time: string;
}

const RemindersSettings = ({ onClose }: RemindersSettingsProps) => {
	const [settings, setSettings] = useState<ReminderSettings>({
		enabled: false,
		frequency: "weekly",
		time: "09:00",
	});

	const handleSave = () => {
		console.log("Saving reminder settings:", settings);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900 flex items-center">
							<FiBell className="w-6 h-6 mr-2 text-blue-600" />
							Progress Reminders
						</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
							title="Close reminder settings"
						>
							<FiX className="w-5 h-5" />
						</button>
					</div>
				</div>

				<div className="p-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<FiBell className="w-5 h-5 text-gray-400 mr-3" />
								<div>
									<p className="font-medium text-gray-900">
										Enable Reminders
									</p>
									<p className="text-sm text-gray-600">
										Get notified to update your progress
									</p>
								</div>
							</div>
							<button
								onClick={() =>
									setSettings((prev) => ({
										...prev,
										enabled: !prev.enabled,
									}))
								}
								className={`${
									settings.enabled
										? "text-blue-600"
										: "text-gray-400"
								} hover:text-blue-700 transition-colors`}
								title={
									settings.enabled
										? "Disable reminders"
										: "Enable reminders"
								}
							>
								{settings.enabled ? (
									<FiToggleRight className="w-8 h-8" />
								) : (
									<FiToggleLeft className="w-8 h-8" />
								)}
							</button>
						</div>

						{settings.enabled && (
							<>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Frequency
									</label>
									<select
										value={settings.frequency}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												frequency: e.target.value as
													| "daily"
													| "weekly",
											}))
										}
										className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										title="Select reminder frequency"
									>
										<option value="daily">Daily</option>
										<option value="weekly">Weekly</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										<FiClock className="w-4 h-4 inline mr-1" />
										Time
									</label>
									<input
										type="time"
										value={settings.time}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												time: e.target.value,
											}))
										}
										className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										title="Select reminder time"
									/>
								</div>

								<div className="p-4 bg-blue-50 rounded-lg">
									<p className="text-sm text-blue-800">
										<FiBell className="w-4 h-4 inline mr-1" />
										You'll receive a {settings.frequency}{" "}
										reminder at {settings.time} to log your
										progress.
									</p>
								</div>
							</>
						)}
					</div>

					<div className="mt-8 flex items-center justify-end space-x-4">
						<button
							onClick={onClose}
							className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleSave}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
						>
							<FiBell className="w-4 h-4 mr-2" />
							Save Settings
						</button>
					</div>
				</div>

				<div className="px-6 pb-6">
					<p className="text-sm text-gray-500">
						Note: Reminder functionality is a demo feature. Actual
						notifications would require backend implementation.
					</p>
				</div>
			</div>
		</div>
	);
};

export default RemindersSettings;
