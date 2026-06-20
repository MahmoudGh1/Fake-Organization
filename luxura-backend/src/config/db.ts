import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
	try {
		const uri = process.env.MONGO_URI;

		if (!uri) {
			throw new Error("MONGO_URI is not defined in environment variables");
		}

		const conn = await mongoose.connect(uri, {
			dbName: "luxura",
		});

		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

		mongoose.connection.on("error", (err) => {
			console.error(`❌ MongoDB connection error: ${err.message}`);
		});

		mongoose.connection.on("disconnected", () => {
			console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
		});
	} catch (error) {
		console.error(`❌ Failed to connect to MongoDB: ${(error as Error).message}`);
		process.exit(1);
	}
};
