import { z } from 'zod';
import { tool } from 'ai';
import { myProvider } from '../providers';
import { generateText } from 'ai';
import axios from 'axios';

// Define the schema for search parameters
export const searchDecklistSchema = z.object({
  commanderName: z.string().optional(),
  deckName: z.string().optional(),
  strategy: z.string().optional(),
  colors: z.string().optional(),
  budget: z.string().optional(),
  powerLevel: z.string().optional()
});

// Interface for structured deck data
interface DeckMetadata {
  deckName: string;
  commander: string;
  url?: string;
  strategy?: string;
  powerLevel?: string;
  budget?: string;
  colors?: string;
}

export const searchDecklistTool = tool({
  description: 'Search for commander decklists based on various criteria',
  parameters: searchDecklistSchema,
  execute: async ({ commanderName, deckName, strategy, colors, budget, powerLevel }) => {
    console.log('searchDecklistTool called with:', { 
      commanderName, deckName, strategy, colors, budget, powerLevel 
    });
    
    // Build search query based on available parameters
    let searchQuery = '';
    
    if (commanderName) {
      searchQuery += `commander "${commanderName}" `;
    }
    
    if (deckName) {
      searchQuery += `"${deckName}" deck `;
    }
    
    if (strategy) {
      searchQuery += `${strategy} strategy `;
    }
    
    if (colors) {
      searchQuery += `${colors} colors `;
    }
    
    if (budget) {
      searchQuery += `${budget} budget `;
    }
    
    if (powerLevel) {
      searchQuery += `power level ${powerLevel} `;
    }
    
    // Default search if no parameters provided
    if (!searchQuery.trim()) {
      searchQuery = "popular commander decks 2025";
    }
    
    searchQuery += " edh commander deck primer";
    
    // Use the search model to find relevant decklists
    const model = myProvider.languageModel('search-model');
    
    const prompt = `
    Search for Commander/EDH decklists matching the following criteria: ${searchQuery}
    
    Find at least 3-5 relevant decklists from sites like moxfield.com, mtgtop8.com, edhrec.com, or archidekt.com.
    
    For each decklist, provide the following information:
    1. Deck name
    2. Commander name
    3. URL to the decklist
    4. Brief description of the deck's strategy
    5. Estimated power level (1-10)
    6. Budget category (budget, mid-range, expensive)
    7. Color identity
    
    Format the response as a JSON array with the following structure:
    [
      {
        "deckName": "Name of the deck",
        "commander": "Commander name",
        "url": "URL to decklist",
        "strategy": "Brief description of strategy",
        "powerLevel": "Estimated power level (1-10)",
        "budget": "Budget category",
        "colors": "Color identity (WUBRG format)"
      },
      // Additional decks...
    ]
    
    Return only the JSON array, no other text.
    `;
    
    try {
      const { text } = await generateText({
        model,
        prompt,
        providerOptions: {
          perplexity: {
            search_domain_filter: ['mtgtop8.com', 'edhrec.com', 'moxfield.com', 'archidekt.com', 'edhtop16.com'],
          },
        },
      });
      
      // Parse the results
      try {
        const deckResults = JSON.parse(text);
        return deckResults;
      } catch (error) {
        console.error('Error parsing deck search results:', error);
        return {
          type: 'text',
          text: 'Error parsing deck search results. Please try again with more specific criteria.',
        };
      }
    } catch (error) {
      console.error('Error searching for decklists:', error);
      return {
        type: 'text',
        text: 'Error searching for decklists. Please try again later.',
      };
    }
  },
});
