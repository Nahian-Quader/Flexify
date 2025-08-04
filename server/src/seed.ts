import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database";
import User from "./models/User";
import MembershipPlan from "./models/MembershipPlan";

dotenv.config();

const seedData = async () => {
	try {
		// Connect to database
		await connectDB();
		console.log("🌱 Starting database seeding...");

		// Clear existing data
		await User.deleteMany({});
		await MembershipPlan.deleteMany({});
		console.log("🧹 Cleared existing data");

		// Create membership plans
		const membershipPlans = [
			{
				name: "Basic Plan",
				durationInMonths: 1,
				price: 29.99,
				description:
					"Perfect for beginners. Access to basic gym equipment and facilities.",
			},
			{
				name: "Standard Plan",
				durationInMonths: 3,
				price: 79.99,
				description:
					"Great for regular gym-goers. Includes group classes and personal training session.",
			},
			{
				name: "Premium Plan",
				durationInMonths: 6,
				price: 149.99,
				description:
					"Best value for committed fitness enthusiasts. Full access to all facilities and unlimited classes.",
			},
			{
				name: "Annual Plan",
				durationInMonths: 12,
				price: 279.99,
				description:
					"Maximum savings for year-round fitness commitment. Includes all premium features plus nutrition consultation.",
			},
			{
				name: "Student Plan",
				durationInMonths: 1,
				price: 19.99,
				description:
					"Special discount for students. Valid student ID required.",
			},
		];

		const createdPlans = await MembershipPlan.insertMany(membershipPlans);
		console.log(`✅ Created ${createdPlans.length} membership plans`);

		// Create users (individually to trigger password hashing)
		const usersData = [
			{
				name: "Admin User",
				email: "admin@flexify.com",
				password: "123456",
				role: "admin",
			},
			{
				name: "Trainer One",
				email: "trainer1@flexify.com",
				password: "123456",
				role: "trainer",
			},
			{
				name: "Trainer Two",
				email: "trainer2@flexify.com",
				password: "123456",
				role: "trainer",
			},
		];

		const createdUsers = [];
		for (const userData of usersData) {
			const user = new User(userData);
			await user.save(); // This triggers the pre-save middleware to hash passwords
			createdUsers.push(user);
		}
		console.log(`✅ Created ${createdUsers.length} users`);

		// Display created users (without passwords)
		console.log("\n📋 Created Users:");
		createdUsers.forEach((user) => {
			console.log(
				`  - ${user.name} (${user.email}) - Role: ${user.role}`
			);
		});

		console.log("\n📋 Created Membership Plans:");
		createdPlans.forEach((plan) => {
			console.log(
				`  - ${plan.name}: $${plan.price} for ${plan.durationInMonths} month(s)`
			);
		});

		console.log("\n🎉 Database seeding completed successfully!");
		console.log("\n🔐 Login Credentials:");
		console.log("  Admin: admin@flexify.com / admin");
		console.log("  Trainer 1: trainer1@flexify.com / trainer1");
		console.log("  Trainer 2: trainer2@flexify.com / trainer2");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
};

// Run seeding if this file is executed directly
if (require.main === module) {
	seedData();
}

export default seedData;
