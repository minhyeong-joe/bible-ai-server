import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const generate_ai_response = async (input, previousResponseId = null) => {
	try {
		const response = await openai.responses.create({
			model: "gpt-4.1-nano",
			input: input,
			store: true,
			...(previousResponseId && { previous_response_id: previousResponseId }),
			prompt: {
				id: process.env.OPENAI_PROMPT_ID,
				version: process.env.OPENAI_PROMPT_VERSION,
			},
		});
		return { text: response.output_text, responseId: response.id };
	} catch (error) {
		console.error("Error generating AI response:", error);
		throw error;
	}
};

export { generate_ai_response };
