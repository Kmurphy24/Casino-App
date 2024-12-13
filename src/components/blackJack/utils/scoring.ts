import { Card, Pip } from "../../../types/card";
import { HandScore } from "./types";

export const scoreHand = (hand: Card[]): HandScore => {
  const handScore: HandScore = {
    score: 0,
    secondaryScore: 0
  };

  let hasAce = false;
  hand.forEach((card) => {
    if (card.pip === Pip.Ace) {
      handScore.score += 1;
      hasAce = true;
    } else if (
      card.pip === Pip.Jack ||
      card.pip === Pip.Queen ||
      card.pip === Pip.King
    ) {
      handScore.score += 10;
    } else {
      handScore.score += Number(card.pip);
    }
  });

  if (hasAce && handScore.score < 12) {
    //adding 10 to the regular score because the 1 is already added when we see the first Ace
    handScore.secondaryScore = handScore.score + 10;
  }

  return handScore;
};

export const checkBlackJack = (cards: Card[]): boolean => {
  const handScore = scoreHand(cards);
  if (
    cards.length === 2 &&
    (handScore.score === 21 || handScore.secondaryScore === 21)
  ) {
    return true;
  }
  return false;
};
