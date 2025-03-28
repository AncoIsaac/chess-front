import { PieceColor, PieceType } from "../../types/chessTypes";

interface PieceProps {
  type: PieceType;
  color: PieceColor;
}

const Piece = ({ type, color }: PieceProps) => {
  const pieceSymbols: Record<PieceType, string> = {
    p: color === "w" ? "♙" : "♙",
    n: color === "w" ? "♞" : "♞",
    b: color === "w" ? "♝" : "♝",
    r: color === "w" ? "♜" : "♜",
    q: color === "w" ? "♛" : "♛",
    k: color === "w" ? "♚" : "♚",
  };
  const pieceColor = color === "w" ? "white" : "black"

  return <div style={{ fontSize: "60px", color: pieceColor }}>{pieceSymbols[type]}</div>;
};

export default Piece;