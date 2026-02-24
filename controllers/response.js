import { generate_ai_response } from "../lib/openAI.js";
import { TYPES, PROMPTS } from "../config/constants.js";
import { AIResponse } from "../models/AIResponse.js";

// In-memory rate limit for forced refresh (use_cache: false)
// Keyed by IP: Array of request timestamps within the window
const refreshRateStore = new Map();
const REFRESH_RATE_LIMIT_MAX = 3;
const REFRESH_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRefreshRateLimit(ip) {
	const now = Date.now();
	const windowStart = now - REFRESH_RATE_WINDOW_MS;
	const timestamps = (refreshRateStore.get(ip) ?? []).filter(
		(t) => t > windowStart,
	);

	if (timestamps.length >= REFRESH_RATE_LIMIT_MAX) {
		const retryAfterMs = REFRESH_RATE_WINDOW_MS - (now - timestamps[0]);
		return { allowed: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
	}

	timestamps.push(now);
	refreshRateStore.set(ip, timestamps);
	return { allowed: true };
}

const getAIResponse = async (req, res) => {
	if (!req.body) {
		return res.status(400).json({ error: "Request body is missing" });
	}
	const { book, chapter, type, language, question, use_cache, verses, previous_response_id } = req.body;
	if (!book || !chapter || !type || !language) {
		return res.status(400).json({
			error: "Missing required fields: book, chapter, type, language",
		});
	}
	if (!Object.values(TYPES).includes(type)) {
		return res.status(400).json({
			error: `Invalid type. Must be ${TYPES.DEVOTION} or ${TYPES.FREEFORM}`,
		});
	}
	if (type === TYPES.FREEFORM && !question) {
		return res.status(400).json({ error: "Missing required field: question" });
	}

	const bypassCache = use_cache === false;

	// Rate limit forced refreshes
	if (bypassCache && type === TYPES.DEVOTION) {
		const ip = req.ip ?? "unknown";
		const { allowed, retryAfterSec } = checkRefreshRateLimit(ip);
		if (!allowed) {
			return res.status(429).json({
				error: "Too many refresh requests. Please try again later.",
				retry_after: retryAfterSec,
			});
		}
	}

	console.log(
		`Received request for AI response: ${book}/${chapter} (${language}, ${type}, cache=${!bypassCache}, API v${process.env.OPENAI_PROMPT_VERSION || "0"})`,
	);

	// Check DB cache (devotion only, skipped when bypassCache)
	if (type !== TYPES.FREEFORM && !bypassCache) {
		const cached = await AIResponse.findOne({
			book,
			chapter,
			language,
			type,
			api_version: process.env.OPENAI_PROMPT_VERSION || "1",
		});

		if (cached) {
			console.log(
				`[AIResponseCache] found ${book}/${chapter} (${language}, ${type}, API v${process.env.OPENAI_PROMPT_VERSION || "0"})`,
			);
			return res.json({ response: cached.response });
		}
	}

	// Format passage: strip to "verseNum text" lines to minimize tokens
	const passage =
		Array.isArray(verses) && verses.length > 0
			? verses.map((v) => `${v.verse} ${v.text}`).join("\n")
			: "";

	// Build the prompt input
	// For FREEFORM follow-ups: just the question (context lives in previous_response_id)
	// For FREEFORM first message or DEVOTION: full context prompt
	const input = PROMPTS[type]
		.replace("{book}", book)
		.replace("{chapter}", chapter)
		.replace("{language}", language)
		.replace("{passage}", passage)
		.replace("{user_question}", question ?? "");
	console.log("Generated prompt:", input);

	const { text: aiText, responseId } = await generate_ai_response(
		type === TYPES.FREEFORM && previous_response_id ? question : input,
		previous_response_id ?? null,
	);

	// Save/overwrite AI response in DB (devotion only)
	if (type !== TYPES.FREEFORM) {
		const apiVersion = process.env.OPENAI_PROMPT_VERSION || "1";
		console.log(
			`[AIResponseCache] ${bypassCache ? "Overwriting" : "Saving"} AI response for ${book}/${chapter} (${language}, ${type}, API v${apiVersion})`,
		);
		await AIResponse.findOneAndUpdate(
			{ book, chapter, language, type, api_version: apiVersion },
			{ $set: { response: aiText } },
			{ upsert: true },
		);
	}

	res.json({
		response: aiText,
		...(type === TYPES.FREEFORM && { response_id: responseId }),
	});
};

export { getAIResponse };
