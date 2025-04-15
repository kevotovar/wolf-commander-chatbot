'use client';

import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ManaCost } from './mana-cost';

interface CardData {
  id: string;
  name: string;
  image_uris?: {
    normal: string;
  };
  card_faces?: Array<{
    image_uris?: {
      normal: string;
    };
  }>;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
}

interface CardListProps {
  cards: CardData[];
  className?: string;
}

export function CardList({ cards, className }: CardListProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
        className,
      )}
    >
      {cards.map((card) => {
        const imageUrl =
          card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;

        return (
          <Card key={card.id} className="flex flex-col">
            <CardHeader className="p-0">
              {imageUrl && (
                <div className="relative aspect-[2.5/3.5] w-full">
                  <Image
                    src={imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <h3 className="font-semibold text-lg">{card.name}</h3>
              {card.mana_cost && (
                <div className="mt-1">
                  <ManaCost cost={card.mana_cost} />
                </div>
              )}
              {card.type_line && (
                <div className="text-sm text-muted-foreground mt-1">
                  {card.type_line}
                </div>
              )}
              {card.oracle_text && (
                <div className="text-sm mt-2">{card.oracle_text}</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 
