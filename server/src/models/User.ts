import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	role: "admin" | "trainer" | "member";
	profilePic?: string;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [50, "Name must not exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
		},
		role: {
			type: String,
			enum: ["admin", "trainer", "member"],
			default: "member",
		},
		profilePic: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

userSchema.methods.comparePassword = async function (
	password: string
): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
	const userObject = this.toObject();
	delete userObject.password;
	return userObject;
};

export default mongoose.model<IUser>("User", userSchema);
