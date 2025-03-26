import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { ChessBoard, PieceColor, PieceType } from "../types/chessTypes";

const useChessGame = () => {
  const [game] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<ChessBoard>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("w");

  // Inicializar el tablero
  useEffect(() => {
    updateBoard();
  }, []);

  const updateBoard = () => {
    const newBoard: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));
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
  };

  const handleSquareClick = (row: number, col: number) => {
    const square = `${String.fromCharCode(97 + col)}${8 - row}`;

    if (!selectedSquare) {
      const piece = game.get(square as any);
      if (piece && piece.color === currentTurn) {
        setSelectedSquare(square);
      }
    } else {
      try {
        game.move({ from: selectedSquare, to: square });
        updateBoard();
      } catch (error) {
        console.error("Movimiento inválido:", error);
      }
      setSelectedSquare(null);
    }
  };

  return { board, handleSquareClick, selectedSquare, currentTurn };
};

export default useChessGame;