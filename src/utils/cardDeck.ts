import { Card, Suit, Pip } from "../types/card.tsx";

export const getFullDeck = () => {
  const fullDeck: Card[] = [];
  for (const suit in Suit) {
    for (const pip in Pip) {
      const newCard: Card = {
        pip: Pip[pip as keyof typeof Pip],
        suit: Suit[suit as keyof typeof Suit]
      };
      fullDeck.push(newCard);
    }
  }
  return fullDeck;
};
