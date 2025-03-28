import Square1 from "../../../components/chess/Square";
import Piece from "../../../components/chess/Piece";
import { ChessBoard, PieceColor, GameResult } from "../../../types/chessTypes";
import style from "../style/Board.module.css";
import { Chess, Square } from "chess.js";

interface BoardProps {
  board: ChessBoard;
  handleSquareClick: (row: number, col: number) => void;
  selectedSquare: Square | null; // Actualizado a Square
  currentTurn: PieceColor;
  gameResult: GameResult | null;
  game: Chess; // Nueva prop para acceder a chess.js
}

const Board = ({
  board,
  handleSquareClick,
  selectedSquare,
  currentTurn,
  gameResult,
  game,
}: BoardProps) => {
  const isKingInCheck = (rowIndex: number, colIndex: number) => {
    const piece = board[rowIndex][colIndex];

    return (
      piece?.type === "k" &&
      piece.color === currentTurn &&
      game.isCheck() &&
      gameResult?.isGameOver === false
    );
  };

  return (
    <>
      <span
        className={`text-lg font-medium flex justify-end pr-.5 ${
          currentTurn === "b" ? "text-green-500" : "text-gray-500"
        }`}
      >
        {currentTurn === "b" && " Tu turno →"} Jugador 2 (Negras) 
      </span>

      <div className={style.chessBoard}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={style.row}>
            {row.map((piece, colIndex) => {
              const square = `${String.fromCharCode(97 + colIndex)}${
                8 - rowIndex
              }`;
              const isCheckSquare = isKingInCheck(rowIndex, colIndex);

              return (
                <Square1
                  key={square}
                  color={
                    (rowIndex + colIndex) % 2 === 0 ? "#f0d9b5" : "#b58863"
                  }
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  isSelected={selectedSquare === square}
                  isCheck={isCheckSquare}
                  isGameOver={gameResult?.isGameOver || false}
                >
                  {piece && <Piece type={piece.type} color={piece.color} />}
                  {isCheckSquare && (
                    <div className={style.checkIndicator}></div>
                  )}
                </Square1>
              );
            })}
          </div>
        ))}
      </div>
      <span
        className={`text-lg font-medium flex justify-end pr-.5 ${
          currentTurn === "w" ? "text-green-500" : "text-gray-500"
        }`}
      >
        {currentTurn === "w" && "Tu turno → "}Jugador 1 (Blancas)
      </span>
    </>
  );
};

export default Board;
