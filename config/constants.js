const TYPES = {
	CONTEXT: "context",
	REFLECTION: "reflection",
};

const PROMPTS = {
	[TYPES.CONTEXT]:
		"Summarize {book} chapter {chapter} for Bible {version} in {language} Language. Divide the chapter into 2-3 main parts with subtitles. Format as bullet points: '- Subtitle (verse range)' followed by a brief summary. Include cultural or historical context only when necessary for understanding (Hebrew terms, geography, timeline, person identification, unfamiliar cultural customs). Be concise. Output only the summary without any introductory phrases.",
	[TYPES.REFLECTION]:
		"Based on {book} chapter {chapter} for Bible {version} in {language} Language, write 2-3 reflection questions that help readers apply the passage to their lives. Cover different events or themes from the chapter when possible. Questions should be biblical and personal. Output only the numbered questions without any introductory or closing remarks. Stay strictly within biblical teaching.",
};

export { TYPES, PROMPTS };
