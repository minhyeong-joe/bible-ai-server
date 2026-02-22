import { generate_ai_response } from "../lib/openAI.js";
import { TYPES, PROMPTS } from "../config/constants.js";
import { AIResponse } from "../models/AIResponse.js";

const getAIResponse = async (req, res) => {
	if (!req.body) {
		return res.status(400).json({ error: "Request body is missing" });
	}
	const { book, chapter, version, type, language } = req.body;
	if (!book || !chapter || !version || !type || !language) {
		return res.status(400).json({
			error: "Missing required fields: book, chapter, version, type, language",
		});
	}
	if (!Object.values(TYPES).includes(type)) {
		return res.status(400).json({
			error: `Invalid type. Must be ${TYPES.CONTEXT} or ${TYPES.REFLECTION}`,
		});
	}

	console.log(
		`Received request for AI response: ${version}/${book}/${chapter} (${language}, ${type})`,
	);

	// check DB for AI response for given version/book/chapter/type/language
	const cached = await AIResponse.findOne({
		version,
		book,
		chapter,
		language,
		type,
		api_version: process.env.OPENAI_PROMPT_VERSION || "1",
	});

	if (cached) {
		console.log(
			`[AIResponseCache] found ${version}/${book}/${chapter} (${language}, ${type})`,
		);
		return res.json({ response: cached.response });
	}

	const input = PROMPTS[type]
		.replace("{book}", book)
		.replace("{chapter}", chapter)
		.replace("{version}", version)
		.replace("{language}", language);
	console.log("Generated prompt:", input);
	const aiResponse = await generate_ai_response(input);

	// Save the AI response to DB
	const newAIResponse = new AIResponse({
		version,
		book,
		chapter,
		language,
		type,
		response: aiResponse,
		api_version: process.env.OPENAI_PROMPT_VERSION || "1",
	});
	await newAIResponse.save();

	res.json({ response: aiResponse });
};

export { getAIResponse };
