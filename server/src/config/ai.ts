import OpenAI from "openai";

export const openai = new OpenAI({
    baseURL: "https://zenmux.ai/api/v1",
    apiKey: process.env.ZENMUX_API_KEY,
});