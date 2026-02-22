import { generate_ai_response } from "../lib/openAI.js";
import { TYPES, PROMPTS } from "../config/constants.js";

const getAIResponse = async (req, res) => {
	if (!req.body) {
		return res.status(400).json({ error: "Request body is missing" });
	}
	const { book, chapter, version, type, language } = req.body;
	if (!book || !chapter || !version || !type || !language) {
		return res
			.status(400)
			.json({
				error:
					"Missing required fields: book, chapter, version, type, language",
			});
	}
	if (!Object.values(TYPES).includes(type)) {
		return res
			.status(400)
			.json({
				error: `Invalid type. Must be ${TYPES.CONTEXT} or ${TYPES.REFLECTION}`,
			});
	}
	const input = PROMPTS[type]
		.replace("{book}", book)
		.replace("{chapter}", chapter)
		.replace("{version}", version)
		.replace("{language}", language);
	console.log("Generated prompt:", input);
	const aiResponse = await generate_ai_response(input);
	res.json({ response: aiResponse });
};

export { getAIResponse };
