import mongoose, { Document, Schema } from "mongoose";

export interface IUserSubscription extends Document {
	user: mongoose.Types.ObjectId;
	membershipPlan: mongoose.Types.ObjectId;
	startDate: Date;
	endDate: Date;
	status: "active" | "expired";
	createdAt: Date;
	updatedAt: Date;
}

const userSubscriptionSchema = new Schema<IUserSubscription>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
		membershipPlan: {
			type: Schema.Types.ObjectId,
			ref: "MembershipPlan",
			required: [true, "Membership plan is required"],
		},
		startDate: {
			type: Date,
			required: [true, "Start date is required"],
		},
		endDate: {
			type: Date,
			required: [true, "End date is required"],
		},
		status: {
			type: String,
			enum: ["active", "expired"],
			default: "active",
		},
	},
	{
		timestamps: true,
	}
);

userSubscriptionSchema.pre("save", function (next) {
	const now = new Date();
	this.status =
		now >= this.startDate && now <= this.endDate ? "active" : "expired";
	next();
});

userSubscriptionSchema.methods.updateStatus = function () {
	const now = new Date();
	this.status =
		now >= this.startDate && now <= this.endDate ? "active" : "expired";
	return this.save();
};

export default mongoose.model<IUserSubscription>(
	"UserSubscription",
	userSubscriptionSchema
);
