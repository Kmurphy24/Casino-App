export type Card = {
  pip: Pip;
  suit: Suit;
};

export enum Suit {
  Clubs = "Clubs",
  Hearts = "Hearts",
  Spades = "Spades",
  Diamonds = "Diamonds"
}

export enum Pip {
  Ace = "A",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K"
}
