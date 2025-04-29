import React from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';

interface DeckMetadata {
  deckName: string;
  commander: string;
  url?: string;
  strategy?: string;
  powerLevel?: string;
  budget?: string;
  colors?: string;
}

interface DecklistSearchResultsProps {
  result: DeckMetadata[];
  wide?: boolean;
}

export function DecklistSearchResults({ result, wide }: DecklistSearchResultsProps) {
  if (!Array.isArray(result) || result.length === 0) {
    return <div className="text-center py-4">No decks found.</div>;
  }

  const cardClass = wide ? 'w-full max-w-3xl mx-auto' : 'w-full';

  return (
    <div className="space-y-4 mt-2">
      {result.map((deck, index) => (
        <Card key={index} className={cardClass}>
          <CardHeader>
            <h3 className="text-lg font-bold">{deck.deckName}</h3>
            <p className="text-sm">Commander: {deck.commander}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {deck.strategy && (
              <p><strong>Strategy:</strong> {deck.strategy}</p>
            )}
            {deck.colors && (
              <p><strong>Colors:</strong> {deck.colors}</p>
            )}
            {deck.powerLevel && (
              <p><strong>Power Level:</strong> {deck.powerLevel}/10</p>
            )}
            {deck.budget && (
              <p><strong>Budget:</strong> {deck.budget}</p>
            )}
            {deck.url && (
              <a
                href={deck.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2"
              >
                <Button variant="link">View Full Deck</Button>
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
