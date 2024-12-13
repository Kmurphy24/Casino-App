import { useCallback, useEffect, useRef, useState } from "react";
import { displayCard, getFullDeck } from "../../sharedUtils/cardDeck";
import { Card } from "../../types/card";
import { HandScore } from "./utils/types";
import { scoreHand, checkBlackJack } from "./utils/scoring";

enum GamePhase {
  "PlayerTurn",
  "DealerTurn",
  "Betting",
  "HandOver"
}

enum RoundResult {
  "Win",
  "Lose",
  "Push",
  ""
}

// Total amount of players
// Currently only Dealer and Player
const TOTAL_PLAYERS = 2;

// Sets the starting chips for the player
// If player doesn't have saved chips in local storage it'll start them at 500
const getStartingChips = () => {
  const userChips = localStorage.getItem("userChips");
  return userChips ? Number(userChips) : 500;
};

export const BlackJack = () => {
  const cardDeck = useRef<Card[]>(getFullDeck(true));
  const [chips, setChips] = useState<number>(getStartingChips());
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
  const [playerBet, setPlayerBet] = useState<number>(0);
  const roundResult = useRef<RoundResult>(RoundResult[""]);

  useEffect(() => {
    localStorage.setItem("userChips", chips.toString());
  }, [chips]);

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
      setGamePhase(GamePhase.HandOver);
    }
  }, [playerScore, gamePhase]);

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

  const checkPayOuts = useCallback(() => {
    const playerBlackJack = checkBlackJack(playerCards);
    const playerScore = Math.max(...Object.values(scoreHand(playerCards)));
    const dealerScore = Math.max(...Object.values(scoreHand(dealerCards)));
    if (playerScore == dealerScore) {
      //Player and dealer have same score so game is a push
      setChips(chips + playerBet);
      roundResult.current = RoundResult.Push;
    } else if (playerBlackJack) {
      //Player has blackjack user get paid out
      setChips(chips + playerBet + playerBet * (3 / 2));
      roundResult.current = RoundResult.Win;
    } else if (playerScore < 22) {
      if (dealerScore > 21 || playerScore > dealerScore) {
        //Dealer busted or player had better score than dealer
        setChips(chips + playerBet * 2);
        roundResult.current = RoundResult.Win;
      } else {
        roundResult.current = RoundResult.Lose;
      }
    } else if (playerScore > 22) {
      //Player bust and loses round
      roundResult.current = RoundResult.Lose;
    }
    setPlayerBet(0);
  }, [chips, dealerCards, playerBet, playerCards]);

  useEffect(() => {
    if (gamePhase === GamePhase.DealerTurn) {
      takeDealerTurn();
    }
    if (gamePhase === GamePhase.HandOver) {
      checkPayOuts();
    }
  }, [gamePhase, takeDealerTurn, checkPayOuts]);

  const dealOpeningHand = () => {
    setChips(chips - playerBet);
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
    if (
      checkBlackJack(dealerStartingCards) ||
      checkBlackJack(playerStartingCards)
    ) {
      setGamePhase(GamePhase.HandOver);
    } else {
      setGamePhase(GamePhase.PlayerTurn);
    }
  };

  const resetDeck = () => {
    setPlayerCards([]);
    setDealerCards([]);
    cardDeck.current = getFullDeck(true);
    setGamePhase(GamePhase.Betting);
  };

  const playerHit = () => {
    const newCard = cardDeck.current.splice(0, 1);
    setPlayerCards(playerCards.concat(newCard));
  };
  return (
    <>
      {gamePhase !== GamePhase.Betting && (
        <div>
          <BlackJackHand
            cards={dealerCards}
            handScore={dealerScore}
            dealerHand={true}
            playerTurn={gamePhase === GamePhase.PlayerTurn}
          />
          <div className="border-b-2 border-dashed my-5"></div>
          {gamePhase === GamePhase.HandOver && (
            <div>{RoundResult[roundResult.current]}</div>
          )}
          <BlackJackHand cards={playerCards} handScore={playerScore} />
        </div>
      )}

      {gamePhase === GamePhase.Betting && (
        <button
          onClick={dealOpeningHand}
          disabled={gamePhase !== GamePhase.Betting || playerBet === 0}
          className="disabled:opacity-25 m-1"
        >
          Deal
        </button>
      )}
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
      {gamePhase === GamePhase.HandOver && (
        <button onClick={resetDeck} className="m-1">
          Clear Cards
        </button>
      )}

      <div>
        Current bet: <span className="font-semibold">{playerBet}</span>
      </div>

      {gamePhase === GamePhase.Betting && (
        <div className="[&>button]:m-1 [&>button:disabled]:opacity-25">
          <button
            onClick={() => setPlayerBet(playerBet + 5)}
            disabled={chips < playerBet + 5}
          >
            +5
          </button>
          <button
            onClick={() => setPlayerBet(playerBet + 25)}
            disabled={chips < playerBet + 25}
          >
            +25
          </button>
          <button
            onClick={() => setPlayerBet(playerBet + 50)}
            disabled={chips < playerBet + 50}
          >
            +50
          </button>
          <button onClick={() => setPlayerBet(0)}>Clear Bet</button>
        </div>
      )}
      <div className="p-4">
        The player has <span className="font-semibold">{chips} chips</span>
        {chips < 5 && <button onClick={() => setChips(500)}>Reset</button>}
      </div>
    </>
  );
};

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
