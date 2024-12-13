import { Card, Suit, Pip } from "../types/card.tsx";

export const getFullDeck = (shuffleCards: boolean): Card[] => {
  let fullDeck: Card[] = [];
  for (const suit in Suit) {
    for (const pip in Pip) {
      const newCard: Card = {
        pip: Pip[pip as keyof typeof Pip],
        suit: Suit[suit as keyof typeof Suit]
      };
      fullDeck.push(newCard);
    }
  }

  if (shuffleCards) {
    fullDeck = shuffleDeck(fullDeck);
  }
  return fullDeck;
};

export const shuffleDeck = (cardDeck: Card[]): Card[] => {
  let shuffleCount = 0;
  const lastIndex = cardDeck.length - 1;
  let currentIndex = 0;
  do {
    const randomIndex = Math.floor(Math.random() * lastIndex);
    [cardDeck[currentIndex], cardDeck[randomIndex]] = [
      cardDeck[randomIndex],
      cardDeck[currentIndex]
    ];
    if (currentIndex >= lastIndex) {
      currentIndex = 0;
      shuffleCount++;
    } else {
      currentIndex++;
    }
  } while (shuffleCount < 10);
  return cardDeck;
};

export const displayCard = (card: Card): JSX.Element => {
  switch (card.suit) {
    case Suit.Clubs:
      return (
        <>
          <span className="text-black">{card.pip}</span>
          <span className="text-black text-3xl">&#9827;</span>
        </>
      );
    case Suit.Diamonds:
      return (
        <>
          <span className="text-red-500">{card.pip}</span>
          <span className="text-red-500 text-3xl">&#9830;</span>
        </>
      );
    case Suit.Hearts:
      return (
        <>
          <span className="text-red-500">{card.pip}</span>
          <span className="text-red-500 text-3xl">&#9829;</span>
        </>
      );
    case Suit.Spades:
      return (
        <>
          <span className="text-black">{card.pip}</span>
          <span className="text-black text-3xl">&#9824;</span>
        </>
      );
  }
};
