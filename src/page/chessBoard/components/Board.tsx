import { useEffect, useState, useMemo, useCallback } from "react";
import { Chess, Square } from "chess.js";
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
  board = [],
  handleSquareClick,
  selectedSquare,
  currentTurn,
  gameResult,
  game,
  isPlay,
  resetGame,
  playerColor,
}: BoardProps) => {
  // Timer states with minutes and seconds separated for better display
  const [blackTime, setBlackTime] = useState(5 * 60); // 5 minutes
  const [whiteTime, setWhiteTime] = useState(5 * 60); // 5 minutes
  const shouldFlipBoard = playerColor === "b";

  // Memoized conversion functions
  const visualToLogical = useCallback(
    (visualRow: number, visualCol: number) => {
      return shouldFlipBoard
        ? { row: 7 - visualRow, col: 7 - visualCol }
        : { row: visualRow, col: visualCol };
    },
    [shouldFlipBoard]
  );

  const algebraicToVisual = useCallback(
    (square: Square | null) => {
      if (!square) return { visualRow: -1, visualCol: -1 };
      
      const col = square.charCodeAt(0) - 97;
      const row = 8 - parseInt(square[1]);
      return shouldFlipBoard
        ? { visualRow: 7 - row, visualCol: 7 - col }
        : { visualRow: row, visualCol: col };
    },
    [shouldFlipBoard]
  );

  // Timer effect
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

  // Reset timers when game resets
  useEffect(() => {
    if (!isPlay) {
      setBlackTime(5 * 60);
      setWhiteTime(5 * 60);
    }
  }, [isPlay]);

  // Check for timeout
  useEffect(() => {
    if (whiteTime === 0) {
      resetGame("b", "timeout");
    } else if (blackTime === 0) {
      resetGame("w", "timeout");
    }
  }, [whiteTime, blackTime, resetGame]);

  // Memoized selected square position
  const selectedVisualPos = useMemo(
    () => algebraicToVisual(selectedSquare),
    [selectedSquare, algebraicToVisual]
  );

  // Memoized valid moves
  const validMoves = useMemo(() => {
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
  }, [selectedSquare, game]);

  // Handle visual click with proper coordinates
  const handleVisualClick = useCallback(
    (visualRow: number, visualCol: number) => {
      const { row, col } = visualToLogical(visualRow, visualCol);
      handleSquareClick(row, col);
    },
    [handleSquareClick, visualToLogical]
  );

  // Check if square contains king in check
  const isKingInCheck = useCallback(
    (row: number, col: number) => {
      const piece = board[row]?.[col];
      return (
        piece?.type === "k" &&
        piece.color === currentTurn &&
        game.isCheck() &&
        !gameResult?.isGameOver
      );
    },
    [board, currentTurn, game, gameResult]
  );

  // Memoized board rendering
  const renderBoard = useMemo(() => {
    return Array(8).fill(null).map((_, visualRow) => {
      const rowSquares = Array(8).fill(null).map((_, visualCol) => {
        const { row, col } = visualToLogical(visualRow, visualCol);
        const piece = board[row]?.[col];
        const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
        
        const isSelected = selectedVisualPos
          ? visualRow === selectedVisualPos.visualRow &&
            visualCol === selectedVisualPos.visualCol
          : false;

        const isValidMove = validMoves.includes(square);
        const isCheck = isKingInCheck(row, col);
        const isLight = (row + col) % 2 === 0;

        return (
          <Square1
            key={`${visualRow}-${visualCol}`}
            color={isLight ? "#f0d9b5" : "#b58863"}
            onClick={() => handleVisualClick(visualRow, visualCol)}
            isSelected={isSelected}
            isCheck={isCheck}
            isGameOver={!!gameResult?.isGameOver}
            isHighlighted={isValidMove}
            isCapture={isValidMove && !!piece && !isSelected}
          >
            {piece && <Piece type={piece.type} color={piece.color} />}
          </Square1>
        );
      });

      return (
        <div key={visualRow} className={style.row}>
          {rowSquares}
        </div>
      );
    });
  }, [
    board,
    visualToLogical,
    selectedVisualPos,
    validMoves,
    isKingInCheck,
    handleVisualClick,
    gameResult,
  ]);

  return (
    <section className={style.boardContainer}>
      {/* Top timer (black) */}
      <div className={style.timerContainer}>
        <TimerCom 
          isActive={currentTurn === "b" && isPlay} 
          time={blackTime} 
          color="black"
          isPlayerTurn={currentTurn === playerColor}
        />
      </div>

      {/* Chess board */}
      <div className={style.chessBoard}>
        {renderBoard}
      </div>

      {/* Bottom timer (white) */}
      <div className={style.timerContainer}>
        <TimerCom 
          isActive={currentTurn === "w" && isPlay} 
          time={whiteTime} 
          color="white"
          isPlayerTurn={currentTurn === playerColor}
        />
      </div>

      {/* Game status */}
      {gameResult?.isGameOver && (
        <div className={style.gameOverBanner}>
          {gameResult.winner 
            ? `Game Over! ${gameResult.winner === "w" ? "White" : "Black"} wins by ${gameResult.reason}`
            : `Game ended in a draw by ${gameResult.reason}`}
        </div>
      )}
    </section>
  );
};

export default Board;