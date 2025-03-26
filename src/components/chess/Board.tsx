
import Square from "./Square";
import Piece from "./Piece";
import { ChessBoard } from "../../types/chessTypes";

interface BoardProps {
  board: ChessBoard;
  handleSquareClick: (row: number, col: number) => void;
  selectedSquare: string | null;
}

const Board = ({ board, handleSquareClick, selectedSquare }: BoardProps) => {

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", }}>
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
          return (
            <Square
              key={square}
              color={(rowIndex + colIndex) % 2 === 0 ? "#f0d9b5" : "#b58863"}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              isSelected={selectedSquare === square}
            >
              {piece && <Piece type={piece.type} color={piece.color} />}
            </Square>
          );
        })
      )}
    </div>
  );
};

export default Board;