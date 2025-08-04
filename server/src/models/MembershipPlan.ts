import mongoose, { Document, Schema } from "mongoose";

export interface IMembershipPlan extends Document {
	name: string;
	durationInMonths: number;
	price: number;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

const membershipPlanSchema = new Schema<IMembershipPlan>(
	{
		name: {
			type: String,
			required: [true, "Plan name is required"],
			unique: true,
			trim: true,
			minlength: [2, "Plan name must be at least 2 characters"],
			maxlength: [50, "Plan name must not exceed 50 characters"],
		},
		durationInMonths: {
			type: Number,
			required: [true, "Duration is required"],
			min: [1, "Duration must be at least 1 month"],
			max: [60, "Duration cannot exceed 60 months"],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, "Description must not exceed 500 characters"],
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<IMembershipPlan>(
	"MembershipPlan",
	membershipPlanSchema
);
