import OpenAI from 'openai';

export const openai = new OpenAI({
  baseURL: 'https://zenmux.ai/api/v1',
  apiKey: process.env.ZENMUX_API_KEY || process.env.OPENAI_API_KEY || 'dummy_api_key_for_init',
});
