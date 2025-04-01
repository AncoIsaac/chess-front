import { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import {
  ChessBoard,
  PieceColor,
  PieceType,
  GameResult,
} from "../types/chessTypes";

const useChessGame = () => {
  const [game] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<ChessBoard>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("w");
  const [gameResult, setGameResult] = useState<GameResult>({
    winner: null,
    reason: "checkmate",
    isGameOver: false,
  });

  // Inicializar el tablero
  useEffect(() => {
    updateBoard();
  }, []);

  const updateBoard = () => {
    const newBoard: ChessBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    game.board().forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (piece) {
          newBoard[rowIndex][colIndex] = {
            type: piece.type as PieceType,
            color: piece.color as PieceColor,
          };
        }
      });
    });

    setBoard(newBoard);
    setCurrentTurn(game.turn() as PieceColor);
    checkGameResult();
  };

  const checkGameResult = () => {
    if (game.isCheckmate()) {
      setGameResult({
        winner: game.turn() === "w" ? "b" : "w",
        reason: "checkmate",
        isGameOver: true,
      });
    } else if (game.isDraw()) {
      setGameResult({
        winner: null,
        reason: getDrawReason() as "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",
        isGameOver: true,
      });
    } else if (game.isCheck()) {
      setGameResult({
        winner: null,
        reason: "check",
        isGameOver: false,
      });
    } else {
      setGameResult({
        winner: null,
        reason: "checkmate",
        isGameOver: false,
      });
    }
  };

  const getDrawReason = (): string => {
    if (game.isStalemate()) return "stalemate";
    if (game.isThreefoldRepetition()) return "threefold_repetition";
    if (game.isInsufficientMaterial()) return "insufficient_material";
    if (game.isDraw()) return "draw";
    return "fifty_move_rule";
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameResult?.isGameOver) return;

    const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === currentTurn) {
        setSelectedSquare(square);
      }
    } else {
      try {
        game.move({
          from: selectedSquare,
          to: square,
          promotion: "q",
        });
        updateBoard();
      } catch (error) {
        console.error("Movimiento inválido:", error);
      }
      setSelectedSquare(square);
    }
  };

  const resetGame = (winner: PieceColor | null = null, reason: string = "reset") => {
    game.reset();
    updateBoard();
    
    if (winner !== null) {
      setGameResult({
        winner,
        reason: reason as any,
        isGameOver: true,
      });
    } else {
      setGameResult({
        winner: null,
        reason: "checkmate",
        isGameOver: false,
      });
    }
    
    setSelectedSquare(null);
  };

  return {
    board,
    handleSquareClick,
    selectedSquare,
    currentTurn,
    gameResult,
    resetGame,
    game,
  };
};

export default useChessGame;