import mongoose from "mongoose";

const TYPES = ["devotion"];

const ResponseSchema = new mongoose.Schema(
	{
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
	book: 1,
	chapter: 1,
	language: 1,
	type: 1,
	api_version: 1,
}); // for efficient querying

export const AIResponse = mongoose.model("AIResponse", ResponseSchema);
