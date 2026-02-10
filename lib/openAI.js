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
        });
        return response.output_text;
    }
    catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
}

// Example code
// const response = openai.responses.create({
//   model: "gpt-5-nano",
//   input: "write a haiku about ai",
//   store: true,
// });

// response.then((result) => console.log(result.output_text));

export { generate_ai_response };