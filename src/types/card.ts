export type Card = {
  pip: Pip;
  suit: Suit;
};

type Suit = "Club" | "Heart" | "Spade" | "Diamond";

type Pip =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";
