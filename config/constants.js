const TYPES = {
	DEVOTION: "devotion",
	FREEFORM: "free-form",
};

const PROMPTS = {
	[TYPES.DEVOTION]:
		"[Devotion] Provide summary by sections, full summary, background and context, spiritual guidance, and reflection questions in {language} language for book of {book} chapter {chapter}. Use book and chapter as reference only. Response should be based on attached passage: {passage}",
	[TYPES.FREEFORM]:
		"[Free-Form] Based on Book of {book} chapter {chapter} in {language} language, answer user's question with relevant Bible verses and commentary. User's question: {user_question}",
};

export { TYPES, PROMPTS };
