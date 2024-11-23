import { useEffect, useRef, useState } from "react";
import "./App.css";
import { getFullDeck } from "./utils/cardDeck";
import { Card, Pip, Suit } from "./types/card";

interface UserScore {
  score: number;
  secondaryScore: number;
}

function App() {
  const cardDeck = useRef<Card[]>(getFullDeck());
  const [chips, setChips] = useState<number>(0);
  const [dealtCards, setDealtCards] = useState<Card[]>([]);
  const [userScore, setUserScore] = useState<UserScore>({
    score: 0,
    secondaryScore: 0
  });

  useEffect(() => {
    const userChips = localStorage.getItem("userChips");

    if (!userChips) {
      setStartingChips();
    } else {
      setChips(Number(userChips));
    }
  }, []);

  useEffect(() => {
    let currentScore = 0;
    let currenSecondaryScore = 0;
    let hasAce = false;
    dealtCards.forEach((card) => {
      if (card.pip === Pip.Ace) {
        currentScore += 1;
        hasAce = true;
      } else if (
        card.pip === Pip.Jack ||
        card.pip === Pip.Queen ||
        card.pip === Pip.King
      ) {
        currentScore += 10;
      } else {
        currentScore += Number(card.pip);
      }
    });

    if (hasAce && currentScore < 11) {
      currenSecondaryScore = currentScore + 11;
    }

    setUserScore({ score: currentScore, secondaryScore: currenSecondaryScore });
  }, [dealtCards]);

  const setStartingChips = () => {
    setChips(500);
    localStorage.setItem("userChips", "500");
  };

  const dealTwoCards = () => {
    const card = cardDeck.current.splice(0, 1);
    setDealtCards(dealtCards.concat(card));
  };

  const resetDeck = () => {
    setDealtCards([]);
    cardDeck.current = getFullDeck();
    shuffleDeck();
  };

  const shuffleDeck = () => {
    let shuffleCount = 0;
    let currentIndex = 51;
    do {
      const randomIndex = Math.floor(Math.random() * 51);
      [cardDeck.current[currentIndex], cardDeck.current[randomIndex]] = [
        cardDeck.current[randomIndex],
        cardDeck.current[currentIndex]
      ];
      if (currentIndex === 0) {
        currentIndex = 51;
        shuffleCount++;
      } else {
        currentIndex--;
      }
    } while (shuffleCount < 10);
  };

  const displaySuit = (suit: Suit) => {
    switch (suit) {
      case Suit.Clubs:
        return <span className="text-black">&#9827;</span>;
      case Suit.Diamonds:
        return <span className="text-red-500">&#9830;</span>;
      case Suit.Hearts:
        return <span className="text-red-500">&#9829;</span>;
      case Suit.Spades:
        return <span className="text-black">&#9824;</span>;
    }
  };

  return (
    <>
      <div className="p-4">The user has {chips} chips</div>
      <button
        onClick={dealTwoCards}
        disabled={userScore.score >= 21}
        className="disabled:opacity-15"
      >
        Deal
      </button>
      <button onClick={resetDeck}>Clear Cards</button>
      <div className="flex">
        {dealtCards.map((card) => (
          <div key={`${card.pip}-${card.suit}`} className="flex flex-col p-2">
            <span>{card.pip}</span>
            <span className="text-3xl">{displaySuit(card.suit)}</span>
          </div>
        ))}
      </div>
      <div>
        {userScore.score > 21 && <div>Player Bust</div>}
        Current card value:&nbsp;
        {userScore.score}
        {userScore.secondaryScore > 0 && ` / ${userScore.secondaryScore}`}
      </div>
    </>
  );
}

export default App;
