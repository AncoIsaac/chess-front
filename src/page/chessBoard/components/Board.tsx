import Square1 from "../../../components/chess/Square";
import Piece from "../../../components/chess/Piece";
import { ChessBoard, PieceColor, GameResult } from "../../../types/chessTypes";
import style from "../style/Board.module.css";
import { Chess, Square } from "chess.js";
import TimerCom from "../../../components/timer/TimerCom";
import { useEffect, useState } from "react";

type BoardProps = {
  board: ChessBoard;
  handleSquareClick: (row: number, col: number) => void;
  selectedSquare: Square | null;
  currentTurn: PieceColor;
  gameResult: GameResult | null;
  game: Chess;
  isPlay: boolean;
  resetGame: (winner?: PieceColor | null, reason?: string) => void;
};

const Board = ({
  board,
  handleSquareClick,
  selectedSquare,
  currentTurn,
  gameResult,
  game,
  isPlay,
  resetGame
}: BoardProps) => {
  const [blackTime, setBlackTime] = useState(1 * 60); // 1 minuto para negras
  const [whiteTime, setWhiteTime] = useState(1 * 60); // 1 minuto para blancas

  // Efecto para controlar el temporizador
  useEffect(() => {
    let interval = null;

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

  // Resetear temporizadores cuando se reinicia el juego
  useEffect(() => {
    if (!isPlay) {
      setBlackTime(1 * 60);
      setWhiteTime(1 * 60);
    }
  }, [isPlay]);

  // Verificar si algún jugador se quedó sin tiempo
  useEffect(() => {
    if (whiteTime === 0) {
      resetGame("b", "timeout");
    } else if (blackTime === 0) {
      resetGame("w", "timeout");
    }
  }, [whiteTime, blackTime ]);

  const isKingInCheck = (rowIndex: number, colIndex: number) => {
    const piece = board[rowIndex][colIndex];
    return (
      piece?.type === "k" &&
      piece.color === currentTurn &&
      game.isCheck() &&
      gameResult?.isGameOver === false
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
    } catch (e) {
      return [];
    }
  };

  const validMoves = selectedSquare ? getValidMoves() : [];

  return (
    <section>
      <div className="flex justify-between">
        <h2>Turno: {currentTurn === "w" ? "Blancas" : "Negras"}</h2>
        <div className="flex gap-4">
          <TimerCom isActive={currentTurn === "b" && isPlay} time={blackTime} />
        </div>
      </div>
      <div className={style.chessBoard}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={style.row}>
            {row.map((piece, colIndex) => {
              const square = `${String.fromCharCode(97 + colIndex)}${
                8 - rowIndex
              }`;
              const isCheckSquare = isKingInCheck(rowIndex, colIndex);
              const isValidMove = validMoves.includes(square as Square);
              const isSelected = selectedSquare === square;

              return (
                <Square1
                  key={square}
                  color={
                    (rowIndex + colIndex) % 2 === 0 ? "#f0d9b5" : "#b58863"
                  }
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  isSelected={isSelected}
                  isCheck={isCheckSquare}
                  isGameOver={gameResult?.isGameOver || false}
                  isHighlighted={isValidMove && !isSelected}
                >
                  {piece && <Piece type={piece.type} color={piece.color} />}
                  {isCheckSquare && (
                    <div className={style.checkIndicator}></div>
                  )}
                  {isValidMove && !isSelected && !piece && (
                    <div className={style.moveIndicator}></div>
                  )}
                  {isValidMove && !isSelected && piece && (
                    <div className={style.captureIndicator}></div>
                  )}
                </Square1>
              );
            })}
          </div>
        ))}
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