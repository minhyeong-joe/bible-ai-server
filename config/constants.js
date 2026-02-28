const TYPES = {
	DEVOTION: "devotion",
	FREEFORM: "free-form",
};

const PROMPTS = {
	[TYPES.DEVOTION]:
		"[Devotion] Provide summary by sections, full summary, background and context, spiritual guidance, and reflection questions for book of {book} chapter {chapter}. Always respond strictly in {language}. Use book and chapter as reference only. Response should be in {language} based on attached passage: {passage}",
	[TYPES.FREEFORM]:
		"[Free-Form] Based on Book of {book} chapter {chapter}. Response should be strictly in {language}. Answer user's question with relevant Bible verses and commentary in {language}. User's question: {user_question}",
};

export { TYPES, PROMPTS };
