import mongoose, { Document, Schema } from "mongoose";

export interface ITimeSlot {
	start: string;
	end: string;
}

export interface ITrainerAvailability extends Document {
	trainer: mongoose.Types.ObjectId;
	date: Date;
	slots: ITimeSlot[];
	createdAt: Date;
	updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>({
	start: {
		type: String,
		required: [true, "Start time is required"],
		match: [
			/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
			"Please provide a valid time format (HH:MM)",
		],
	},
	end: {
		type: String,
		required: [true, "End time is required"],
		match: [
			/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
			"Please provide a valid time format (HH:MM)",
		],
	},
});

const trainerAvailabilitySchema = new Schema<ITrainerAvailability>(
	{
		trainer: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Trainer ID is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
		slots: {
			type: [timeSlotSchema],
			required: [true, "At least one time slot is required"],
			validate: {
				validator: function (slots: ITimeSlot[]) {
					return slots.length > 0;
				},
				message: "At least one time slot must be provided",
			},
		},
	},
	{
		timestamps: true,
	}
);

trainerAvailabilitySchema.index({ trainer: 1, date: 1 }, { unique: true });

export default mongoose.model<ITrainerAvailability>(
	"TrainerAvailability",
	trainerAvailabilitySchema
);
