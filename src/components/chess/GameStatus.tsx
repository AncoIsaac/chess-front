import React from "react";
import { GameResult, PieceColor } from "../../types/chessTypes";

interface GameStatusProps {
  currentTurn: PieceColor;
  playerColor: PieceColor | null;
  gameResult: GameResult | null;
  isConnected: boolean;
  opponentConnected: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({
  currentTurn,
  playerColor,
  gameResult,
  isConnected,
  opponentConnected,
}) => {

  console.log('opponentConnected', opponentConnected)
  if (!isConnected) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4">
        Connecting to server...
      </div>
    );
  }

  if (!opponentConnected) {
    return (
      <div className="bg-blue-100 text-blue-800 p-2 rounded mb-4">
        Waiting for opponent to join...
      </div>
    );
  }

  if (gameResult?.isGameOver) {
    return (
      <div className="bg-green-100 text-green-800 p-2 rounded mb-4">
        {gameResult.winner
          ? `Game over! ${gameResult.winner === "w" ? "White" : "Black"} wins by ${gameResult.reason}`
          : `Game ended in a draw by ${gameResult.reason}`}
      </div>
    );
  }

  const isPlayerTurn = currentTurn === playerColor;

  return (
    <div
      className={`p-2 rounded mb-4 ${
        isPlayerTurn
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {isPlayerTurn
        ? "Your turn - make a move!"
        : "Waiting for opponent's move..."}
    </div>
  );
};

export default GameStatus;