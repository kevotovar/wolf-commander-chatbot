import { z } from 'zod';
import { tool } from 'ai';
import { myProvider } from '../providers';
import { scryfallSearchInstructions } from '../scryfallSearcher';
import { generateText } from 'ai';
import axios from 'axios';

export const searchCardsSchema = z.object({
  query: z.string(),
});

export const searchCardsTool = tool({
  description: 'Search for cards in the database',
  parameters: searchCardsSchema,
  execute: async ({ query }) => {
    const model = myProvider.languageModel('search-cards-model');
    const prompt = `Generate a search query for the card ${query},
    following the Scryfall search syntax. ${scryfallSearchInstructions}.
    If the user wants a color, try to be only that color.
    Return the query only, no other text, no markdown, no code block.
    write the query in english.
    `;
    const { text } = await generateText({
      model,
      prompt,
    });

    const { data: cards } = await axios.get(
      `https://api.scryfall.com/cards/search`,
      {
        params: {
          q: text,
          limit: 10,
        },
      },
    );
    return [
      {
        type: 'text',
        text: JSON.stringify(cards.data.splice(0, 10)),
      },
    ];
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
