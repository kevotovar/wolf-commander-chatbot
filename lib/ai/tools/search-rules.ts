import { tool, generateText } from 'ai';
import { myProvider } from '../providers';
import { z } from 'zod';

// Schema for search rules parameters
export const searchRulesSchema = z.object({
  query: z.string().describe('Rule name or topic to search in official MTG rules'),
});

// Tool to search official Magic: The Gathering rules and rulings
export const searchRulesTool = tool({
  description: 'Search official Magic: The Gathering rules and rulings on Wizards sites',
  parameters: searchRulesSchema,
  execute: async ({ query }) => {
    // Use the search-model for official rule lookup
    const model = myProvider.languageModel('search-model');
    const prompt = `
Search for the official Magic: The Gathering comprehensive rules or rulings regarding "${query}".
Only search official Wizards of the Coast sources (e.g., magic.wizards.com, gatherer.wizards.com).

Provide a concise summary and include the URL to the source.

Return the result as JSON:
{
  "query": "${query}",
  "summary": "concise summary of the rule or ruling",
  "url": "official source URL"
}
Return only valid JSON.
    `;

    try {
      const { text } = await generateText({
        model,
        prompt,
        providerOptions: {
          perplexity: {
            search_domain_filter: ['magic.wizards.com', 'gatherer.wizards.com', 'media.wizards.com'],
          },
        },
      });
      // Attempt to parse JSON result
      try {
        return JSON.parse(text);
      } catch {
        return { type: 'text', text };
      }
    } catch (error) {
      console.error('Error searching rules:', error);
      return { type: 'text', text: 'Error searching official MTG rules. Please try again later.' };
    }
  },
});
