import { tool, generateText } from 'ai';
import { myProvider } from '../providers';
import { z } from 'zod';
import { edhBannedCards } from '../bannedCards';

export const suggestDecklistSchema = z.object({
  query: z.string(),
});

interface Suggestion {
  deckName: string;
  commander: string;
  url: string;
  strategy?: string;
  powerLevel?: number;
  budget?: string;
  colors?: string;
}

export const suggestDecklistTool = tool({
  description:
    'Suggest commander decks based on user preferences using reasoning model',
  parameters: suggestDecklistSchema,
  execute: async ({ query }) => {
    console.log('suggestDecklistTool called with:', { query });
    const model = myProvider.languageModel('search-reasoning-model');
    const prompt = `
You are an optimizer that helps users with their questions about Magic: The Gathering Commander format.
Optimize deck suggestions based on the user's query: "${query}".
Do not recommend cards that are banned or restricted in cEDH: ${edhBannedCards}.
Provide 3-5 diverse commander deck suggestions, each with:
1. deckName
2. commander
3. url
4. brief strategy description
5. estimated power level (1-10)
6. budget category (budget, mid-range, expensive)
7. color identity (WUBRG format)

Return the response as a JSON array of objects of the form:
[
  {
    "deckName": "...",
    "commander": "...",
    "url": "...",
    "strategy": "...",
    "powerLevel": 7,
    "budget": "mid-range",
    "colors": "UG"
  }
]
    `.trim();

    try {
      const { text } = await generateText({ model, prompt });
      const suggestions = JSON.parse(text) as Suggestion[];
      return suggestions;
    } catch (error) {
      console.error('Error in suggestDecklistTool:', error);
      return {
        type: 'text',
        text: 'Sorry, I could not generate deck suggestions. Please try again with different preferences.',
      };
    }
  },
});
