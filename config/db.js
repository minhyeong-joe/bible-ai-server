import mongoose from "mongoose";

const connectToDatabase = async () => {
	const { DB_USERNAME, DB_PASSWORD, DB_URI, DB_APP_NAME } = process.env;
	const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URI}/${DB_APP_NAME}?retryWrites=true&w=majority`;
	try {
		const conn = await mongoose.connect(uri);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectToDatabase;
