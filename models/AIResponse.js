import mongoose from "mongoose";

const TYPES = ["reflection", "context"];

const ResponseSchema = new mongoose.Schema(
	{
		version: { type: String, required: true },
		book: { type: String, required: true },
		chapter: { type: Number, required: true },
		language: { type: String, required: true },
		type: { type: String, enum: TYPES, required: true },
		response: { type: String, required: true },
		api_version: { type: String, default: "1" }, // to invalidate old responses if AI prompt is updated
	},
	{ timestamps: true },
);

ResponseSchema.index({
	version: 1,
	book: 1,
	chapter: 1,
	language: 1,
	type: 1,
	api_version: 1,
}); // for efficient querying

export const AIResponse = mongoose.model("AIResponse", ResponseSchema);
