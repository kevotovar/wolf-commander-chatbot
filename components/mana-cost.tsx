'use client';

import { cn } from '@/lib/utils';

interface ManaCostProps {
  cost: string;
  className?: string;
}

const MANA_SYMBOLS: Record<string, string> = {
  '{W}': 'W',
  '{U}': 'U',
  '{B}': 'B',
  '{R}': 'R',
  '{G}': 'G',
  '{C}': 'C',
  '{0}': '0',
  '{1}': '1',
  '{2}': '2',
  '{3}': '3',
  '{4}': '4',
  '{5}': '5',
  '{6}': '6',
  '{7}': '7',
  '{8}': '8',
  '{9}': '9',
  '{10}': '10',
  '{11}': '11',
  '{12}': '12',
  '{13}': '13',
  '{14}': '14',
  '{15}': '15',
  '{16}': '16',
  '{17}': '17',
  '{18}': '18',
  '{19}': '19',
  '{20}': '20',
  '{X}': 'X',
  '{Y}': 'Y',
  '{Z}': 'Z',
  '{S}': 'S',
  '{P}': 'P',
  '{E}': 'E',
  '{T}': 'T',
  '{Q}': 'Q',
};

const ManaSymbol = ({ symbol }: { symbol: string }) => {
  // Official MTG mana symbol colors
  const colors = {
    W: '#F9F9F9',
    U: '#0E68AB',
    B: '#150B00',
    R: '#D3202A',
    G: '#00733E',
    C: '#CAC5C0',
  };

  // Generic mana symbol (numbers, X, Y, Z, etc.)
  if (!['W', 'U', 'B', 'R', 'G', 'C'].includes(symbol)) {
    return (
      <svg viewBox="0 0 100 100" className="size-5">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#CAC5C0"
          stroke="black"
          strokeWidth="2"
        />
        <text x="50" y="60" textAnchor="middle" fontSize="40" fill="black">
          {symbol}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="size-5">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill={colors[symbol as keyof typeof colors]}
        stroke="black"
        strokeWidth="2"
      />
      <path
        d={
          symbol === 'W'
            ? 'M50 20 L60 40 L80 40 L65 55 L75 80 L50 65 L25 80 L35 55 L20 40 L40 40 Z'
            : symbol === 'U'
              ? 'M30 30 Q50 20 70 30 L60 50 Q50 40 40 50 Z'
              : symbol === 'B'
                ? 'M30 30 L70 30 L50 70 Z'
                : symbol === 'R'
                  ? 'M30 30 L70 30 L50 70 Z'
                  : symbol === 'G'
                    ? 'M30 50 L50 30 L70 50 L50 70 Z'
                    : 'M50 20 A30 30 0 1 1 50 80 A30 30 0 1 1 50 20 Z'
        }
        fill="white"
      />
    </svg>
  );
};

export function ManaCost({ cost, className }: ManaCostProps) {
  if (!cost) return null;

  // Extract mana symbols from the cost string
  const symbols = cost.match(/\{[^}]+\}/g) || [];

  return (
    <div className={cn('flex flex-row gap-1', className)}>
      {symbols.map((symbol) => {
        const manaSymbol = MANA_SYMBOLS[symbol];
        if (!manaSymbol) return null;

        return (
          <div key={symbol}>
            <ManaSymbol symbol={manaSymbol} />
          </div>
        );
      })}
    </div>
  );
} 
