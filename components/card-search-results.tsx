'use client';

import { CardList } from './card-list';
import { LoaderIcon } from './icons';

interface CardSearchResultsProps {
  result?: {
    [key: string]: string;
  }[];
  isLoading?: boolean;
}

export function CardSearchResults({
  result,
  isLoading,
}: CardSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <LoaderIcon size={24} />
        </div>
      </div>
    );
  }

  if (!result || result.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No cards found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardList cards={result as any} />
    </div>
  );
} 
