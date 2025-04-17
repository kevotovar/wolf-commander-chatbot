import { z } from 'zod';
import { tool } from 'ai';
import { myProvider } from '../providers';
import { generateText } from 'ai';

export const searchCedhSchema = z.object({
  query: z.string(),
});

export const searchCedhTool = tool({
  description: 'Sear for cards on the website',
  parameters: searchCedhSchema,
  execute: async ({ query }) => {
    console.log('searchCedhTool', query);
    const model = myProvider.languageModel('search-model');
    const prompt = `Generate a search query for the decks ${query}.
    `;

    const { text } = await generateText({
      model,
      prompt,
      providerOptions: {
        perplexity: {
          search_domain_filter: ['www.mtgtop8.com', 'edhtop16.com'],
        },
      },
    });

    return text;
  },
  experimental_toToolResultContent: (response) => {
    return [
      {
        type: 'text',
        text: JSON.stringify(response),
      },
    ];
  },
});
