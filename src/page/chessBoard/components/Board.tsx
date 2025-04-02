import { useEffect, useState } from "react";
import { Chess, Square } from "chess.js";
// import Square1 from "./Square";
// import Piece from "./Piece";
// import TimerCom from "./Timer";
// import { ChessBoard, GameResult, PieceColor } from "../types/chessTypes";
import style from "../style/Board.module.css";
import { ChessBoard, GameResult, PieceColor } from "../../../types/chessTypes";
import TimerCom from "../../../components/timer/TimerCom";
import Square1 from "../../../components/chess/Square";
import Piece from "../../../components/chess/Piece";

type BoardProps = {
  board: ChessBoard;
  handleSquareClick: (row: number, col: number) => void;
  selectedSquare: Square | null;
  currentTurn: PieceColor;
  gameResult: GameResult | null;
  game: Chess;
  isPlay: boolean;
  resetGame: (winner?: PieceColor | null, reason?: string) => void;
  playerColor: PieceColor | null;
};

const Board = ({
  board = [], // Valor por defecto para board
  handleSquareClick,
  selectedSquare,
  currentTurn,
  gameResult,
  game,
  isPlay,
  resetGame,
  playerColor,
}: BoardProps) => {
  const [blackTime, setBlackTime] = useState(1 * 60);
  const [whiteTime, setWhiteTime] = useState(1 * 60);
  const shouldFlipBoard = playerColor === "b";

  // Función segura para acceder al tablero
  const getPieceAt = (row: number, col: number) => {
    if (!board || !board[row] || board[row][col] === undefined) {
      return null;
    }
    return board[row][col];
  };

  // Convertir coordenadas visuales a lógicas
  const visualToLogical = (visualRow: number, visualCol: number) => {
    return shouldFlipBoard
      ? { row: 7 - visualRow, col: 7 - visualCol }
      : { row: visualRow, col: visualCol };
  };

  // Convertir notación algebraica a coordenadas visuales
  const algebraicToVisual = (square: Square | null) => {
    if (!square) return { visualRow: -1, visualCol: -1 };
    
    const col = square.charCodeAt(0) - 97;
    const row = 8 - parseInt(square[1]);
    return shouldFlipBoard
      ? { visualRow: 7 - row, visualCol: 7 - col }
      : { visualRow: row, visualCol: col };
  };

  // Efecto para el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlay && !gameResult?.isGameOver) {
      interval = setInterval(() => {
        if (currentTurn === "w") {
          setWhiteTime((prev) => (prev > 0 ? prev - 1 : 0));
        } else {
          setBlackTime((prev) => (prev > 0 ? prev - 1 : 0));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTurn, gameResult, isPlay]);

  // Resetear tiempos cuando se reinicia el juego
  useEffect(() => {
    if (!isPlay) {
      setBlackTime(1 * 60);
      setWhiteTime(1 * 60);
    }
  }, [isPlay]);

  // Verificar si se acabó el tiempo
  useEffect(() => {
    if (whiteTime === 0) {
      resetGame("b", "timeout");
    } else if (blackTime === 0) {
      resetGame("w", "timeout");
    }
  }, [whiteTime, blackTime, resetGame]);

  const handleVisualClick = (visualRow: number, visualCol: number) => {
    const { row, col } = visualToLogical(visualRow, visualCol);
    handleSquareClick(row, col);
  };

  const isKingInCheck = (row: number, col: number) => {
    const piece = getPieceAt(row, col);
    return (
      piece?.type === "k" &&
      piece.color === currentTurn &&
      game.isCheck() &&
      !gameResult?.isGameOver
    );
  };

  const getValidMoves = () => {
    if (!selectedSquare) return [];
    try {
      return game
        .moves({
          square: selectedSquare,
          verbose: true,
        })
        .map((move) => move.to);
    } catch {
      return [];
    }
  };

  const validMoves = selectedSquare ? getValidMoves() : [];
  const selectedVisualPos = algebraicToVisual(selectedSquare);

  // Crear un tablero seguro para renderizar
  const renderBoard = Array(8).fill(null).map((_, visualRow) => {
    const rowSquares = Array(8).fill(null).map((_, visualCol) => {
      const { row, col } = visualToLogical(visualRow, visualCol);
      const piece = getPieceAt(row, col);
      const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
      
      const isSelected = selectedVisualPos
        ? visualRow === selectedVisualPos.visualRow &&
          visualCol === selectedVisualPos.visualCol
        : false;

      const isValidMove = validMoves.includes(square);
      const isCheck = isKingInCheck(row, col);

      return (
        <Square1
          key={`${visualRow}-${visualCol}`}
          color={(row + col) % 2 === 0 ? "#f0d9b5" : "#b58863"}
          onClick={() => handleVisualClick(visualRow, visualCol)}
          isSelected={isSelected}
          isCheck={isCheck}
          isGameOver={!!gameResult?.isGameOver}
          isHighlighted={isValidMove && !isSelected}
        >
          {piece && <Piece type={piece.type} color={piece.color} />}
          {isCheck && <div className={style.checkIndicator} />}
          {isValidMove && !isSelected && !piece && (
            <div className={style.moveIndicator} />
          )}
          {isValidMove && !isSelected && piece && (
            <div className={style.captureIndicator} />
          )}
        </Square1>
      );
    });

    return (
      <div key={visualRow} className={style.row}>
        {rowSquares}
      </div>
    );
  });

  return (
    <section>
      <div className="flex justify-between">
        <h2>Turno: {currentTurn === "w" ? "Blancas" : "Negras"}</h2>
        <div className="flex gap-4">
          <TimerCom isActive={currentTurn === "b" && isPlay} time={blackTime} />
        </div>
      </div>

      <div className={style.chessBoard}>
        {renderBoard}
      </div>

      <div className="flex justify-between pt-2">
        <h2>Turno: {currentTurn === "w" ? "Blancas" : "Negras"}</h2>
        <div className="flex gap-4">
          <TimerCom isActive={currentTurn === "w" && isPlay} time={whiteTime} />
        </div>
      </div>
    </section>
  );
};

export default Board;