import mongoose from "mongoose";

const VerseSchema = new mongoose.Schema(
	{
		book_id: { type: String, required: true },
		book: { type: String, required: true },
		chapter: { type: Number, required: true },
		verse: { type: Number, required: true },
		text: { type: String, required: true },
	},
	{ _id: false },
);

const TranslationSchema = new mongoose.Schema(
	{
		identifier: { type: String, required: true },
		name: { type: String, required: true },
		language: { type: String, required: true },
		language_code: { type: String, required: true },
		license: { type: String, default: "" },
	},
	{ _id: false },
);

const BibleChapterSchema = new mongoose.Schema(
	{
		version: { type: String, required: true, lowercase: true },
		bookId: { type: String, required: true, uppercase: true },
		chapter: { type: Number, required: true },
		translation: { type: TranslationSchema, required: true },
		verses: { type: [VerseSchema], required: true },
	},
	{
		timestamps: true,
	},
);

BibleChapterSchema.index(
	{ version: 1, bookId: 1, chapter: 1 },
	{ unique: true },
); // index for efficient lookup and preventing dupes

export const BibleChapter = mongoose.model("BibleChapter", BibleChapterSchema);
