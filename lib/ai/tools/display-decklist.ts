import { z } from 'zod';
import { tool } from 'ai';
import { myProvider } from '../providers';
import { generateText } from 'ai';

// Define TypeScript interfaces for better type safety
interface DeckCategory {
  commander: string[];
  ramp: string[];
  cardDraw: string[];
  removal: string[];
  boardWipes: string[];
  protection: string[];
  winConditions: string[];
  synergy: string[];
  lands: string[];
  other: string[];
  [key: string]: string[];
}

interface ColorDistribution {
  W?: number;
  U?: number;
  B?: number;
  R?: number;
  G?: number;
  C?: number;
  [key: string]: number | undefined;
}

interface CardTypeDistribution {
  Creatures?: number;
  Instants?: number;
  Sorceries?: number;
  Artifacts?: number;
  Enchantments?: number;
  Lands?: number;
  [key: string]: number | undefined;
}

interface DeckStats {
  avgCmc?: string | number;
  colorDistribution?: ColorDistribution;
  cardTypeDistribution?: CardTypeDistribution;
}

interface DeckData {
  deckName: string;
  commander?: string;
  strategy?: string;
  powerLevel?: string | number;
  keyCards?: string[];
  categories?: DeckCategory;
  stats?: DeckStats;
}

// Use literal type "text" for the type property to match ToolResultContent requirements
interface FormattedContentItem {
  type: "text";
  text: string;
}

export const displayDecklistSchema = z.object({
  deckName: z.string().optional(),
  deckUrl: z.string().optional(),
  commander: z.string().optional(),
  cards: z.array(z.string()).optional(),
  rawDeckData: z.string().optional(),
});

export const displayDecklistTool = tool({
  description: 'Display a decklist in a visually appealing format with card categories and statistics',
  parameters: displayDecklistSchema,
  execute: async ({ deckName, deckUrl, commander, cards, rawDeckData }) => {
    console.log('displayDecklistTool called', { deckName, deckUrl, commander });
    
    // If raw deck data is provided, parse it
    let deckData: Partial<DeckData> = {};
    let parsedCards = cards || [];
    
    if (rawDeckData) {
      try {
        // Attempt to parse the raw deck data if it's in JSON format
        deckData = JSON.parse(rawDeckData) as Partial<DeckData>;
        
        // Extract cards if available in the parsed data
        if (deckData.categories && Object.values(deckData.categories).some(Array.isArray)) {
          // Flatten all category arrays into a single array if categories exist
          parsedCards = Object.values(deckData.categories)
            .filter(Array.isArray)
            .flatMap(cardArray => cardArray);
        }
      } catch (error) {
        console.error('Error parsing raw deck data:', error);
      }
    }
    
    // Use AI to organize and categorize the deck if we have cards
    let organizedDeck: DeckData = { deckName: deckName || 'Commander Deck' };
    
    if (parsedCards.length > 0 || deckUrl) {
      const model = myProvider.languageModel('search-cards-model');
      
      const prompt = `
      Analyze this Commander deck${deckName ? ` named "${deckName}"` : ''}${commander ? ` with commander "${commander}"` : ''}${deckUrl ? ` from URL: ${deckUrl}` : ''}.
      ${parsedCards.length > 0 ? `Cards in deck: ${parsedCards.join(', ')}` : ''}
      
      Organize the deck into the following categories:
      1. Commander(s)
      2. Ramp
      3. Card Draw
      4. Removal
      5. Board Wipes
      6. Protection
      7. Win Conditions
      8. Synergy Pieces
      9. Lands
      10. Other
      
      For each category, list the cards that belong there. If a card fits multiple categories, place it in the most relevant one.
      Also provide a brief deck strategy summary and power level assessment.
      
      Format the response as a JSON object with the following structure:
      {
        "deckName": "Name of the deck",
        "commander": "Commander name",
        "strategy": "Brief description of the deck strategy",
        "powerLevel": "Estimated power level (1-10)",
        "categories": {
          "commander": ["Commander cards"],
          "ramp": ["Ramp cards"],
          "cardDraw": ["Card draw cards"],
          "removal": ["Removal cards"],
          "boardWipes": ["Board wipe cards"],
          "protection": ["Protection cards"],
          "winConditions": ["Win condition cards"],
          "synergy": ["Synergy pieces"],
          "lands": ["Land cards"],
          "other": ["Other cards"]
        },
        "stats": {
          "avgCmc": "Average converted mana cost",
          "colorDistribution": {"W": 10, "U": 15, "B": 20, "R": 5, "G": 25},
          "cardTypeDistribution": {"Creatures": 30, "Instants": 15, "Sorceries": 10, "Artifacts": 10, "Enchantments": 5, "Lands": 30}
        }
      }
      
      Return only the JSON object, no other text.
      `;
      
      try {
        const { text } = await generateText({
          model,
          prompt,
        });
        
        try {
          organizedDeck = JSON.parse(text) as DeckData;
        } catch (error) {
          console.error('Error parsing AI response:', error);
          // If parsing fails, return the raw text
          return {
            type: 'text',
            text: text,
          };
        }
      } catch (error) {
        console.error('Error generating deck analysis:', error);
        return {
          type: 'text',
          text: 'Error analyzing deck. Please try again with more information.',
        };
      }
    } else if (deckName || commander) {
      // If we only have a deck name or commander but no cards, do a search
      const model = myProvider.languageModel('search-model');
      const searchQuery = deckName || commander;
      
      const prompt = `
      Find information about the Commander deck ${searchQuery}.
      Return a JSON object with deck information in the following format:
      {
        "deckName": "Name of the deck",
        "commander": "Commander name",
        "strategy": "Brief description of the deck strategy",
        "powerLevel": "Estimated power level (1-10)",
        "keyCards": ["Important card 1", "Important card 2", "..."]
      }
      
      Return only the JSON object, no other text.
      `;
      
      try {
        const { text } = await generateText({
          model,
          prompt,
          providerOptions: {
            perplexity: {
              search_domain_filter: ['www.mtgtop8.com', 'edhtop16.com', 'moxfield.com', 'archidekt.com'],
            },
          },
        });
        
        try {
          organizedDeck = JSON.parse(text) as DeckData;
        } catch (error) {
          console.error('Error parsing AI response:', error);
          return {
            type: 'text',
            text: text,
          };
        }
      } catch (error) {
        console.error('Error searching for deck:', error);
        return {
          type: 'text',
          text: 'Error finding deck information. Please provide more details.',
        };
      }
    } else {
      return {
        type: 'text',
        text: 'Please provide at least a deck name, commander name, deck URL, or list of cards.',
      };
    }
    
    return organizedDeck;
  },
  experimental_toToolResultContent: (response) => {
    // If response is already a string, parse it
    const deckData: DeckData = typeof response === 'string' ? JSON.parse(response) : response;
    
    // Format the deck data into a visually appealing display
    const formattedContent: FormattedContentItem[] = [];
    
    // Add deck header
    formattedContent.push({
      type: 'text',
      text: `# ${deckData.deckName || 'Commander Deck'}\n\n`,
    });
    
    // Add commander and strategy
    if (deckData.commander) {
      formattedContent.push({
        type: 'text',
        text: `## Commander: ${deckData.commander}\n\n`,
      });
    }
    
    if (deckData.strategy) {
      formattedContent.push({
        type: 'text',
        text: `### Strategy\n${deckData.strategy}\n\n`,
      });
    }
    
    if (deckData.powerLevel) {
      formattedContent.push({
        type: 'text',
        text: `**Power Level:** ${deckData.powerLevel}/10\n\n`,
      });
    }
    
    // Add key cards if available
    if (deckData.keyCards && Array.isArray(deckData.keyCards)) {
      formattedContent.push({
        type: 'text',
        text: `### Key Cards\n${deckData.keyCards.map(card => `- ${card}`).join('\n')}\n\n`,
      });
    }
    
    // Add categories if available
    if (deckData.categories) {
      formattedContent.push({
        type: 'text',
        text: `## Card Categories\n\n`,
      });
      
      const categoryNames: Record<string, string> = {
        commander: 'Commander',
        ramp: 'Ramp',
        cardDraw: 'Card Draw',
        removal: 'Removal',
        boardWipes: 'Board Wipes',
        protection: 'Protection',
        winConditions: 'Win Conditions',
        synergy: 'Synergy Pieces',
        lands: 'Lands',
        other: 'Other'
      };
      
      for (const [category, cards] of Object.entries(deckData.categories)) {
        if (Array.isArray(cards) && cards.length > 0) {
          formattedContent.push({
            type: 'text',
            text: `### ${categoryNames[category] || category} (${cards.length})\n${cards.map(card => `- ${card}`).join('\n')}\n\n`,
          });
        }
      }
    }
    
    // Add stats if available
    if (deckData.stats) {
      formattedContent.push({
        type: 'text',
        text: `## Deck Statistics\n\n`,
      });
      
      if (deckData.stats.avgCmc) {
        formattedContent.push({
          type: 'text',
          text: `**Average CMC:** ${deckData.stats.avgCmc}\n\n`,
        });
      }
      
      if (deckData.stats.colorDistribution) {
        const colorNames: Record<string, string> = {
          W: 'White',
          U: 'Blue',
          B: 'Black',
          R: 'Red',
          G: 'Green',
          C: 'Colorless'
        };
        
        formattedContent.push({
          type: 'text',
          text: `### Color Distribution\n`,
        });
        
        const colorEntries = Object.entries(deckData.stats.colorDistribution);
        if (colorEntries.length > 0) {
          formattedContent.push({
            type: 'text',
            text: colorEntries.map(([color, count]) => 
              `- ${colorNames[color] || color}: ${count} cards`
            ).join('\n') + '\n\n',
          });
        }
      }
      
      if (deckData.stats.cardTypeDistribution) {
        formattedContent.push({
          type: 'text',
          text: `### Card Type Distribution\n`,
        });
        
        const typeEntries = Object.entries(deckData.stats.cardTypeDistribution);
        if (typeEntries.length > 0) {
          formattedContent.push({
            type: 'text',
            text: typeEntries.map(([type, count]) => 
              `- ${type}: ${count} cards`
            ).join('\n') + '\n\n',
          });
        }
      }
    }
    
    return formattedContent;
  },
});
