import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
	FiX,
	FiSave,
	FiCalendar,
	FiActivity,
	FiAlertCircle,
	FiInfo,
} from "react-icons/fi";
import { useMetricsStore } from "../store/metricsStore";
import type { MetricsData } from "../store/metricsStore";

interface MetricsFormProps {
	metrics?: MetricsData | null;
	onClose: () => void;
	onSuccess: () => void;
}

interface FormData {
	date: string;
	weight: string;
	bodyFat: string;
	muscleMass: string;
	waist: string;
	chest: string;
	hips: string;
	biceps: string;
	thighs: string;
	height: string;
}

interface ValidationErrors {
	[key: string]: string;
}

interface FieldValidation {
	min: number;
	max: number;
	step: string;
}

const MetricsForm = ({ metrics, onClose, onSuccess }: MetricsFormProps) => {
	const { createMetrics, updateMetrics, loading } = useMetricsStore();

	const [formData, setFormData] = useState<FormData>({
		date: new Date().toISOString().split("T")[0],
		weight: "",
		bodyFat: "",
		muscleMass: "",
		waist: "",
		chest: "",
		hips: "",
		biceps: "",
		thighs: "",
		height: "",
	});

	const [errors, setErrors] = useState<ValidationErrors>({});

	// Validation rules based on the backend model
	const validationRules: { [key: string]: FieldValidation } = {
		weight: { min: 20, max: 500, step: "0.1" },
		bodyFat: { min: 1, max: 50, step: "0.1" },
		muscleMass: { min: 10, max: 200, step: "0.1" },
		waist: { min: 40, max: 200, step: "0.5" },
		chest: { min: 60, max: 200, step: "0.5" },
		hips: { min: 60, max: 200, step: "0.5" },
		biceps: { min: 15, max: 80, step: "0.5" },
		thighs: { min: 30, max: 100, step: "0.5" },
		height: { min: 100, max: 250, step: "0.5" },
	};

	useEffect(() => {
		if (metrics) {
			setFormData({
				date: new Date(metrics.date).toISOString().split("T")[0],
				weight: metrics.weight?.toString() || "",
				bodyFat: metrics.bodyFat?.toString() || "",
				muscleMass: metrics.muscleMass?.toString() || "",
				waist: metrics.waist?.toString() || "",
				chest: metrics.chest?.toString() || "",
				hips: metrics.hips?.toString() || "",
				biceps: metrics.biceps?.toString() || "",
				thighs: metrics.thighs?.toString() || "",
				height: metrics.height?.toString() || "",
			});
		}
	}, [metrics]);

	// Validation function
	const validateField = (name: string, value: string): string => {
		if (!value || value.trim() === "") {
			if (name === "weight") {
				return "Weight is required";
			}
			return ""; // Optional fields can be empty
		}

		const numValue = parseFloat(value);
		if (isNaN(numValue)) {
			return "Please enter a valid number";
		}

		const rules = validationRules[name];
		if (rules) {
			if (numValue < rules.min) {
				return `Minimum allowed value is ${rules.min}`;
			}
			if (numValue > rules.max) {
				return `Maximum allowed value is ${rules.max}`;
			}
		}

		return "";
	};

	// Validate all fields
	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};

		// Validate date
		if (!formData.date) {
			newErrors.date = "Date is required";
		} else {
			const selectedDate = new Date(formData.date);
			const today = new Date();
			if (selectedDate > today) {
				newErrors.date = "Future dates are not allowed";
			}
		}

		// Validate all numeric fields
		Object.keys(formData).forEach((key) => {
			if (key !== "date") {
				const error = validateField(
					key,
					formData[key as keyof FormData]
				);
				if (error) {
					newErrors[key] = error;
				}
			}
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field if it exists
		if (errors[name]) {
			const newErrors = { ...errors };
			delete newErrors[name];
			setErrors(newErrors);
		}

		// Validate the field in real-time
		if (value) {
			const error = validateField(name, value);
			if (error) {
				setErrors((prev) => ({
					...prev,
					[name]: error,
				}));
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!validateForm()) {
			toast.error("Please fix the errors in the form");
			return;
		}

		try {
			const metricsData = {
				date: formData.date,
				weight: parseFloat(formData.weight),
				...(formData.bodyFat && {
					bodyFat: parseFloat(formData.bodyFat),
				}),
				...(formData.muscleMass && {
					muscleMass: parseFloat(formData.muscleMass),
				}),
				...(formData.waist && { waist: parseFloat(formData.waist) }),
				...(formData.chest && { chest: parseFloat(formData.chest) }),
				...(formData.hips && { hips: parseFloat(formData.hips) }),
				...(formData.biceps && { biceps: parseFloat(formData.biceps) }),
				...(formData.thighs && { thighs: parseFloat(formData.thighs) }),
				...(formData.height && { height: parseFloat(formData.height) }),
			};

			if (metrics) {
				await updateMetrics(metrics.id, metricsData);
				toast.success("Metrics updated successfully");
			} else {
				await createMetrics(metricsData);
				toast.success("Metrics added successfully");
			}

			onSuccess();
		} catch (error) {
			toast.error("Failed to save metrics");
		}
	};

	const formFields = [
		{
			name: "weight",
			label: "Weight",
			unit: "kg",
			required: true,
			step: "0.1",
		},
		{
			name: "bodyFat",
			label: "Body Fat",
			unit: "%",
			required: false,
			step: "0.1",
		},
		{
			name: "muscleMass",
			label: "Muscle Mass",
			unit: "kg",
			required: false,
			step: "0.1",
		},
		{
			name: "waist",
			label: "Waist",
			unit: "cm",
			required: false,
			step: "0.5",
		},
		{
			name: "chest",
			label: "Chest",
			unit: "cm",
			required: false,
			step: "0.5",
		},
		{
			name: "hips",
			label: "Hips",
			unit: "cm",
			required: false,
			step: "0.5",
		},
		{
			name: "biceps",
			label: "Biceps",
			unit: "cm",
			required: false,
			step: "0.5",
		},
		{
			name: "thighs",
			label: "Thighs",
			unit: "cm",
			required: false,
			step: "0.5",
		},
		{
			name: "height",
			label: "Height",
			unit: "cm",
			required: false,
			step: "0.5",
		},
	];

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900 flex items-center">
							<FiActivity className="w-6 h-6 mr-2 text-blue-600" />
							{metrics
								? "Edit Metrics Entry"
								: "Add New Metrics Entry"}
						</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
							title="Close form"
						>
							<FiX className="w-5 h-5" />
						</button>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="p-6">
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<FiCalendar className="w-4 h-4 inline mr-1" />
							Date *
						</label>
						<input
							type="date"
							name="date"
							value={formData.date}
							onChange={handleChange}
							max={new Date().toISOString().split("T")[0]}
							className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.date
									? "border-red-300 bg-red-50"
									: "border-gray-300"
							}`}
							required
							title="Select date for metrics entry"
						/>
						{errors.date && (
							<div className="mt-2 flex items-center text-red-600 text-sm">
								<FiAlertCircle className="w-4 h-4 mr-1" />
								{errors.date}
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{formFields.map((field) => {
							const hasError = errors[field.name];
							const rules = validationRules[field.name];

							return (
								<div key={field.name}>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{field.label} {field.required && "*"} (
										{field.unit})
									</label>
									<input
										type="number"
										name={field.name}
										value={
											formData[
												field.name as keyof FormData
											]
										}
										onChange={handleChange}
										step={field.step}
										min={rules?.min}
										max={rules?.max}
										className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
											hasError
												? "border-red-300 bg-red-50"
												: "border-gray-300"
										}`}
										placeholder={`Enter ${field.label.toLowerCase()}`}
										required={field.required}
									/>

									{/* Validation rules display */}
									{rules && !hasError && (
										<div className="mt-1 flex items-center text-gray-500 text-xs">
											<FiInfo className="w-3 h-3 mr-1" />
											Range: {rules.min} - {rules.max}{" "}
											{field.unit}
										</div>
									)}

									{/* Error message */}
									{hasError && (
										<div className="mt-2 flex items-center text-red-600 text-sm">
											<FiAlertCircle className="w-4 h-4 mr-1" />
											{hasError}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Validation Summary */}
					{Object.keys(errors).length > 0 && (
						<div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-center mb-2">
								<FiAlertCircle className="w-5 h-5 text-red-600 mr-2" />
								<h4 className="text-sm font-medium text-red-800">
									Please fix the following errors:
								</h4>
							</div>
							<ul className="text-sm text-red-700 space-y-1">
								{Object.entries(errors).map(
									([field, error]) => (
										<li
											key={field}
											className="flex items-center"
										>
											<span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
											<span className="capitalize">
												{field}:
											</span>{" "}
											{error}
										</li>
									)
								)}
							</ul>
						</div>
					)}

					<div className="mt-8 flex items-center justify-end space-x-4">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || Object.keys(errors).length > 0}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
						>
							{loading ? (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							) : (
								<FiSave className="w-4 h-4 mr-2" />
							)}
							{metrics ? "Update" : "Save"} Metrics
						</button>
					</div>
				</form>

				<div className="px-6 pb-6">
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start">
							<FiInfo className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-blue-800 mb-2">
									Measurement Guidelines
								</h4>
								<div className="text-sm text-blue-700 space-y-1">
									<p>
										• <strong>Required:</strong> Date and
										Weight must be provided
									</p>
									<p>
										• <strong>Consistency:</strong> Take
										measurements at the same time of day
									</p>
									<p>
										• <strong>Validation:</strong> All
										values are checked against healthy
										ranges
									</p>
									<p>
										• <strong>Future dates:</strong> Not
										allowed for data integrity
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MetricsForm;
