import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
	user: mongoose.Types.ObjectId;
	checkInTime: Date;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
		checkInTime: {
			type: Date,
			required: [true, "Check-in time is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
	},
	{
		timestamps: true,
	}
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
