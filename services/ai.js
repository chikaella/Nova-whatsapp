import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import "dotenv/config";
import config from "../config.js";

const groq = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

const model = groq("llama-3.3-70b-versatile");

// Store conversation history
const conversations = new Map();

export async function chat(userId, message) {
    if (!conversations.has(userId)) {
        conversations.set(userId, []);
    }

    const history = conversations.get(userId);

    history.push({
        role: "user",
        content: message
    });

    const result = await generateText({
        model,
        system: config.personality,
        messages: history
    });

    history.push({
        role: "assistant",
        content: result.text
    });

    // Keep only the latest messages
    if (history.length > config.historyLimit * 2) {
        history.splice(0, history.length - config.historyLimit * 2);
    }

    return result.text;
}
