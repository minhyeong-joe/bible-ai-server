import express from "express";
import cors from "cors";
import corsConfig from "./config/cors.js";
import dotenv from "dotenv";
dotenv.config();
import aiRoutes from "./routes/ai.js";
import bibleRoutes from "./routes/bible.js";
import { validateApiKey } from "./middleware/auth.js";
import connectToDatabase from "./config/db.js";

const app = express();
app.use(cors(corsConfig));
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.use("/api", validateApiKey, aiRoutes);
app.use("/data", bibleRoutes);

await connectToDatabase();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
