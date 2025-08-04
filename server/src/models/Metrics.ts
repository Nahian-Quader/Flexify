import mongoose, { Document, Schema } from "mongoose";

export interface IMetrics extends Document {
	user: mongoose.Types.ObjectId;
	date: Date;
	weight: number;
	bodyFat?: number;
	muscleMass?: number;
	waist?: number;
	chest?: number;
	hips?: number;
	biceps?: number;
	thighs?: number;
	height?: number;
	createdAt: Date;
	updatedAt: Date;
}

const metricsSchema = new Schema<IMetrics>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
		weight: {
			type: Number,
			required: [true, "Weight is required"],
			min: [20, "Weight must be at least 20 kg"],
			max: [500, "Weight cannot exceed 500 kg"],
		},
		bodyFat: {
			type: Number,
			min: [1, "Body fat percentage must be at least 1%"],
			max: [50, "Body fat percentage cannot exceed 50%"],
		},
		muscleMass: {
			type: Number,
			min: [10, "Muscle mass must be at least 10 kg"],
			max: [200, "Muscle mass cannot exceed 200 kg"],
		},
		waist: {
			type: Number,
			min: [40, "Waist measurement must be at least 40 cm"],
			max: [200, "Waist measurement cannot exceed 200 cm"],
		},
		chest: {
			type: Number,
			min: [60, "Chest measurement must be at least 60 cm"],
			max: [200, "Chest measurement cannot exceed 200 cm"],
		},
		hips: {
			type: Number,
			min: [60, "Hips measurement must be at least 60 cm"],
			max: [200, "Hips measurement cannot exceed 200 cm"],
		},
		biceps: {
			type: Number,
			min: [15, "Biceps measurement must be at least 15 cm"],
			max: [80, "Biceps measurement cannot exceed 80 cm"],
		},
		thighs: {
			type: Number,
			min: [30, "Thighs measurement must be at least 30 cm"],
			max: [100, "Thighs measurement cannot exceed 100 cm"],
		},
		height: {
			type: Number,
			min: [100, "Height must be at least 100 cm"],
			max: [250, "Height cannot exceed 250 cm"],
		},
	},
	{
		timestamps: true,
	}
);

metricsSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<IMetrics>("Metrics", metricsSchema);
