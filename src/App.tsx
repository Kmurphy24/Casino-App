import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { getFullDeck } from "./utils/cardDeck";
import { Card, Pip, Suit } from "./types/card";

interface HandScore {
  score: number;
  secondaryScore: number;
}

enum GamePhase {
  "PlayerTurn",
  "DealerTurn",
  "Betting",
  "HandOver"
}

// Total amount of players
// Currently only Dealer and Player
const TOTAL_PLAYERS = 2;

function App() {
  const cardDeck = useRef<Card[]>(getFullDeck());
  const [chips, setChips] = useState<number>(0);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState<HandScore>({
    score: 0,
    secondaryScore: 0
  });
  const [dealerScore, setDealerScore] = useState<HandScore>({
    score: 0,
    secondaryScore: 0
  });
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.Betting);

  useEffect(() => {
    const userChips = localStorage.getItem("userChips");

    if (!userChips) {
      setStartingChips();
    } else {
      setChips(Number(userChips));
    }
    shuffleDeck();
  }, []);

  useEffect(() => {
    const currentPlayerScore = scoreHand(playerCards);
    setPlayerScore({
      score: currentPlayerScore.score,
      secondaryScore: currentPlayerScore.secondaryScore
    });

    const currentDealerScore = scoreHand(dealerCards);
    setDealerScore({
      score: currentDealerScore.score,
      secondaryScore: currentDealerScore.secondaryScore
    });
  }, [playerCards, dealerCards]);

  useEffect(() => {
    if (gamePhase === GamePhase.PlayerTurn && playerScore.score > 21) {
      setGamePhase(GamePhase.DealerTurn);
    }
  }, [playerScore, gamePhase]);

  const setStartingChips = () => {
    setChips(500);
    localStorage.setItem("userChips", "500");
  };

  const takeDealerTurn = useCallback(() => {
    let currentDealerHand: Card[] = dealerCards;
    let currentDealerScore: HandScore = dealerScore;
    while (
      currentDealerScore.score < 17 &&
      currentDealerScore.secondaryScore < 17
    ) {
      const nextCard = cardDeck.current.splice(0, 1);
      currentDealerHand = currentDealerHand.concat(nextCard);
      currentDealerScore = scoreHand(currentDealerHand);
    }
    setGamePhase(GamePhase.HandOver);
    setDealerCards(currentDealerHand);
  }, [dealerCards, dealerScore]);

  useEffect(() => {
    if (gamePhase === GamePhase.DealerTurn) {
      takeDealerTurn();
    }
  }, [gamePhase, takeDealerTurn]);

  const scoreHand = (hand: Card[]): HandScore => {
    //TODO Fix detecting blackjack
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

  const dealOpeningHand = () => {
    let playerStartingCards: Card[] = [];
    let dealerStartingCards: Card[] = [];
    for (let i = 1; i <= TOTAL_PLAYERS; i++) {
      const cardOne = cardDeck.current.splice(0, 1);
      playerStartingCards = playerStartingCards.concat(cardOne);
      const cardTwo = cardDeck.current.splice(0, 1);
      dealerStartingCards = dealerStartingCards.concat(cardTwo);
    }
    setPlayerCards(playerStartingCards);
    setDealerCards(dealerStartingCards);
    if (checkDealerBlackJack(dealerStartingCards)) {
      setGamePhase(GamePhase.HandOver);
    } else {
      setGamePhase(GamePhase.PlayerTurn);
    }
  };

  const checkDealerBlackJack = (cards: Card[]): boolean => {
    const openingScore = scoreHand(cards);
    if (openingScore.score === 21 || openingScore.secondaryScore === 21) {
      return true;
    }

    return false;
  };

  const resetDeck = () => {
    setPlayerCards([]);
    setDealerCards([]);
    cardDeck.current = getFullDeck();
    shuffleDeck();
    setGamePhase(GamePhase.Betting);
  };

  const shuffleDeck = () => {
    let shuffleCount = 0;
    const lastIndex = cardDeck.current.length - 1;
    let currentIndex = 0;
    do {
      const randomIndex = Math.floor(Math.random() * lastIndex);
      [cardDeck.current[currentIndex], cardDeck.current[randomIndex]] = [
        cardDeck.current[randomIndex],
        cardDeck.current[currentIndex]
      ];
      if (currentIndex >= lastIndex) {
        currentIndex = 0;
        shuffleCount++;
      } else {
        currentIndex++;
      }
    } while (shuffleCount < 10);
  };

  const playerHit = () => {
    const newCard = cardDeck.current.splice(0, 1);
    setPlayerCards(playerCards.concat(newCard));
  };

  return (
    <>
      <div hidden={gamePhase === GamePhase.Betting}>
        <BlackJackHand
          cards={dealerCards}
          handScore={dealerScore}
          dealerHand={true}
          playerTurn={gamePhase === GamePhase.PlayerTurn}
        />
        <div className="border-b-2 border-dashed my-5"></div>
        <BlackJackHand cards={playerCards} handScore={playerScore} />
      </div>

      <button
        onClick={dealOpeningHand}
        disabled={gamePhase !== GamePhase.Betting}
        className="disabled:opacity-15 m-1"
      >
        Deal
      </button>
      {gamePhase === GamePhase.PlayerTurn && (
        <>
          <button
            onClick={playerHit}
            className="m-1"
            disabled={
              playerScore?.score === 21 || playerScore?.secondaryScore === 21
            }
          >
            Hit
          </button>
          <button
            onClick={() => setGamePhase(GamePhase.DealerTurn)}
            className="m-1"
          >
            Stand
          </button>
        </>
      )}
      <button onClick={resetDeck} className="m-1">
        Clear Cards
      </button>
      <div className="p-4">The user has {chips} chips</div>
    </>
  );
}

type CardHandProps = {
  cards: Card[];
  handScore: HandScore;
  dealerHand?: boolean;
  playerTurn?: boolean;
};

const BlackJackHand = ({
  cards,
  handScore,
  dealerHand,
  playerTurn
}: CardHandProps) => {
  const displayCard = (card: Card) => {
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

  return (
    <>
      <div className="flex justify-center">
        {cards.map((card, index) => (
          <div
            key={`${card.pip}-${card.suit}`}
            className="flex flex-col p-2 border border-black rounded-md bg-white m-1 playingCard"
          >
            {dealerHand && playerTurn && index === 1 ? (
              <div className="bg-slate-700 rounded-md h-96"></div>
            ) : (
              <>{displayCard(card)}</>
            )}
          </div>
        ))}
      </div>
      <div hidden={dealerHand && playerTurn}>
        {handScore.score > 21 && (
          <div>{dealerHand ? "Dealer" : "Player"} Bust</div>
        )}
        Current card value:&nbsp;
        {handScore.score}
        {handScore.secondaryScore > 0 && ` / ${handScore.secondaryScore}`}
      </div>
    </>
  );
};

export default App;
