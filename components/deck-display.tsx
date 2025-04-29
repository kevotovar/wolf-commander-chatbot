import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface CardCategory {
  name: string;
  cards: string[];
}

interface ColorDistribution {
  [color: string]: number;
}

interface CardTypeDistribution {
  [type: string]: number;
}

interface DeckStats {
  avgCmc?: string | number;
  colorDistribution?: ColorDistribution;
  cardTypeDistribution?: CardTypeDistribution;
}

interface DeckDisplayProps {
  result: {
    deckName: string;
    commander?: string;
    strategy?: string;
    powerLevel?: string | number;
    keyCards?: string[];
    categories?: {
      [key: string]: string[];
    };
    stats?: DeckStats;
  };
}

const categoryOrder = [
  "commander",
  "ramp",
  "cardDraw",
  "removal",
  "boardWipes",
  "protection",
  "winConditions",
  "synergy",
  "lands",
  "other"
];

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

const colorNames: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  C: 'Colorless'
};

export function DeckDisplay({ result }: DeckDisplayProps) {
  // Prepare data for display
  const categories: CardCategory[] = [];
  
  if (result.categories) {
    // Sort categories in preferred order
    categoryOrder.forEach(key => {
      if (result.categories?.[key] && result.categories[key].length > 0) {
        categories.push({
          name: categoryNames[key] || key,
          cards: result.categories[key]
        });
      }
    });
    
    // Add any remaining categories not in categoryOrder
    Object.entries(result.categories)
      .filter(([key]) => !categoryOrder.includes(key))
      .forEach(([key, cards]) => {
        if (cards.length > 0) {
          categories.push({
            name: categoryNames[key] || key,
            cards
          });
        }
      });
  }
  
  const hasStats = result.stats && (
    result.stats.avgCmc || 
    (result.stats.colorDistribution && Object.keys(result.stats.colorDistribution).length > 0) ||
    (result.stats.cardTypeDistribution && Object.keys(result.stats.cardTypeDistribution).length > 0)
  );
  
  return (
    <Card className="w-full mt-2">
      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold">{result.deckName || 'Commander Deck'}</h3>
        {result.commander && <div className="text-lg font-medium">Commander: {result.commander}</div>}
        {result.powerLevel && <div className="text-sm text-muted-foreground">Power Level: {result.powerLevel}/10</div>}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {categories.length > 0 && <TabsTrigger value="categories">Categories</TabsTrigger>}
            {hasStats && <TabsTrigger value="stats">Stats</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {result.strategy && (
              <div>
                <h4 className="font-semibold mb-2">Strategy</h4>
                <p>{result.strategy}</p>
              </div>
            )}
            
            {result.keyCards && result.keyCards.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Cards</h4>
                <ul className="list-disc pl-5">
                  {result.keyCards.map((card, index) => (
                    <li key={index}>{card}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Show a sample of cards from each category in overview */}
            {categories.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Deck Composition</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">{category.name} ({category.cards.length})</h5>
                      <ul className="list-disc pl-5 text-sm">
                        {category.cards.slice(0, 3).map((card, cardIndex) => (
                          <li key={cardIndex}>{card}</li>
                        ))}
                        {category.cards.length > 3 && (
                          <li className="italic text-muted-foreground">
                            +{category.cards.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {categories.length > 0 && (
            <TabsContent value="categories" className="space-y-4">
              {categories.map((category, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-2">{category.name} ({category.cards.length})</h4>
                  <ul className="list-disc pl-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                    {category.cards.map((card, cardIndex) => (
                      <li key={cardIndex}>{card}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>
          )}
          
          {hasStats && (
            <TabsContent value="stats" className="space-y-4">
              {result.stats?.avgCmc && (
                <div>
                  <h4 className="font-semibold mb-2">Average CMC</h4>
                  <p>{result.stats.avgCmc}</p>
                </div>
              )}
              
              {result.stats?.colorDistribution && Object.keys(result.stats.colorDistribution).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Color Distribution</h4>
                  <ul className="list-disc pl-5">
                    {Object.entries(result.stats.colorDistribution).map(([color, count], index) => (
                      <li key={index}>{colorNames[color] || color}: {count} cards</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.stats?.cardTypeDistribution && Object.keys(result.stats.cardTypeDistribution).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Card Type Distribution</h4>
                  <ul className="list-disc pl-5">
                    {Object.entries(result.stats.cardTypeDistribution).map(([type, count], index) => (
                      <li key={index}>{type}: {count} cards</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
