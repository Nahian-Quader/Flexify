import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	FiPlus,
	FiEdit2,
	FiTrash2,
	FiDollarSign,
	FiClock,
	FiX,
	FiSave,
} from "react-icons/fi";
import { useMembershipStore } from "../store/membershipStore";

interface PlanFormData {
	name: string;
	durationInMonths: number;
	price: number;
	description: string;
}

const AdminMembershipManagement = () => {
	const {
		plans,
		loading,
		error,
		fetchPlans,
		createPlan,
		updatePlan,
		deletePlan,
		clearError,
	} = useMembershipStore();
	const [showModal, setShowModal] = useState(false);
	const [editingPlan, setEditingPlan] = useState<string | null>(null);
	const [formData, setFormData] = useState<PlanFormData>({
		name: "",
		durationInMonths: 1,
		price: 0,
		description: "",
	});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchPlans();
	}, [fetchPlans]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			clearError();
		}
	}, [error, clearError]);

	const resetForm = () => {
		setFormData({
			name: "",
			durationInMonths: 1,
			price: 0,
			description: "",
		});
		setEditingPlan(null);
		setShowModal(false);
	};

	const handleEdit = (plan: any) => {
		setFormData({
			name: plan.name,
			durationInMonths: plan.durationInMonths,
			price: plan.price,
			description: plan.description || "",
		});
		setEditingPlan(plan.id);
		setShowModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!formData.name.trim() ||
			formData.durationInMonths < 1 ||
			formData.price < 0
		) {
			toast.error("Please fill in all required fields with valid values");
			return;
		}

		setSubmitting(true);
		try {
			if (editingPlan) {
				await updatePlan(editingPlan, formData);
				toast.success("Membership plan updated successfully");
			} else {
				await createPlan(formData);
				toast.success("Membership plan created successfully");
			}
			resetForm();
		} catch (error) {
			// Error is handled in the store and displayed via toast above
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (planId: string, planName: string) => {
		if (
			window.confirm(
				`Are you sure you want to delete the "${planName}" membership plan?`
			)
		) {
			try {
				await deletePlan(planId);
				toast.success("Membership plan deleted successfully");
			} catch (error) {
				// Error is handled in the store
			}
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						Membership Plans Management
					</h2>
					<button
						onClick={() => setShowModal(true)}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
					>
						<FiPlus className="w-4 h-4 mr-2" />
						Add New Plan
					</button>
				</div>

				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading plans...</p>
					</div>
				) : plans.length === 0 ? (
					<div className="text-center py-8">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiDollarSign className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No membership plans
						</h3>
						<p className="text-gray-600">
							Create your first membership plan to get started.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{plans.map((plan) => (
							<div
								key={plan.id}
								className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
							>
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900">
										{plan.name}
									</h3>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => handleEdit(plan)}
											className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
											title="Edit plan"
										>
											<FiEdit2 className="w-4 h-4" />
										</button>
										<button
											onClick={() =>
												handleDelete(plan.id, plan.name)
											}
											className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
											title="Delete plan"
										>
											<FiTrash2 className="w-4 h-4" />
										</button>
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center text-gray-600">
											<FiDollarSign className="w-4 h-4 mr-2" />
											<span>Price</span>
										</div>
										<span className="font-semibold text-gray-900">
											${plan.price}
										</span>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center text-gray-600">
											<FiClock className="w-4 h-4 mr-2" />
											<span>Duration</span>
										</div>
										<span className="font-semibold text-gray-900">
											{plan.durationInMonths} month
											{plan.durationInMonths !== 1
												? "s"
												: ""}
										</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-gray-600">
											Monthly Rate
										</span>
										<span className="font-semibold text-gray-900">
											$
											{(
												plan.price /
												plan.durationInMonths
											).toFixed(2)}
										</span>
									</div>
								</div>

								{plan.description && (
									<div className="mt-4 pt-4 border-t border-gray-200">
										<p className="text-sm text-gray-600">
											{plan.description}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">
								{editingPlan
									? "Edit Membership Plan"
									: "Add New Membership Plan"}
							</h3>
							<button
								type="button"
								onClick={resetForm}
								className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
								aria-label="Close modal"
							>
								<FiX className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Plan Name *
								</label>
								<input
									type="text"
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="e.g., Basic, Premium, Elite"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="durationInMonths"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Duration (Months) *
								</label>
								<input
									type="number"
									id="durationInMonths"
									min="1"
									max="60"
									value={formData.durationInMonths}
									onChange={(e) =>
										setFormData({
											...formData,
											durationInMonths:
												parseInt(e.target.value) || 1,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="price"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Price ($) *
								</label>
								<input
									type="number"
									id="price"
									min="0"
									step="0.01"
									value={formData.price}
									onChange={(e) =>
										setFormData({
											...formData,
											price:
												parseFloat(e.target.value) || 0,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="0.00"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Description
								</label>
								<textarea
									id="description"
									rows={3}
									value={formData.description}
									onChange={(e) =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Optional description of the plan benefits..."
								/>
							</div>

							<div className="flex items-center justify-end space-x-3 pt-4">
								<button
									type="button"
									onClick={resetForm}
									className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								>
									{submitting ? (
										<div className="flex items-center">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											{editingPlan
												? "Updating..."
												: "Creating..."}
										</div>
									) : (
										<>
											<FiSave className="w-4 h-4 mr-2" />
											{editingPlan
												? "Update Plan"
												: "Create Plan"}
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminMembershipManagement;
