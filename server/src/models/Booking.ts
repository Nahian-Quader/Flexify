import mongoose, { Document, Schema } from "mongoose";

export interface IBookingSlot {
	start: string;
	end: string;
}

export interface IBooking extends Document {
	member: mongoose.Types.ObjectId;
	trainer: mongoose.Types.ObjectId;
	date: Date;
	slot: IBookingSlot;
	status: "booked" | "cancelled" | "completed";
	createdAt: Date;
	updatedAt: Date;
}

const bookingSlotSchema = new Schema<IBookingSlot>({
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

const bookingSchema = new Schema<IBooking>(
	{
		member: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Member ID is required"],
		},
		trainer: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Trainer ID is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
		slot: {
			type: bookingSlotSchema,
			required: [true, "Time slot is required"],
		},
		status: {
			type: String,
			enum: ["booked", "cancelled", "completed"],
			default: "booked",
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
