import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const generate_ai_response = async (input) => {
	try {
		const response = await openai.responses.create({
			model: "gpt-4.1-nano",
			input: input,
			store: true,
			prompt: {
				id: process.env.OPENAI_PROMPT_ID,
				version: process.env.OPENAI_PROMPT_VERSION,
			},
		});
		return response.output_text;
	} catch (error) {
		console.error("Error generating AI response:", error);
		throw error;
	}
};

export { generate_ai_response };
