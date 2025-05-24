import OpenAI from 'openai';

export const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'https://readlater.local', // optional but polite
    'X-Title': 'ReadLaterAI',
  },
});
