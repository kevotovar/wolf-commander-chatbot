import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createPerplexity } from '@ai-sdk/perplexity';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const perplexity = createPerplexity({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openrouter('google/gemini-2.0-flash-lite-001'),
    'chat-model-reasoning': wrapLanguageModel({
      model: openrouter('google/gemini-2.5-pro-preview-03-25'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'search-model': perplexity('perplexity/sonar-pro'),
    'title-model': openrouter('google/gemini-2.0-flash-lite-001'),
    'search-cards-model': openrouter('google/gemini-2.0-flash-lite-001'),
  },
});
