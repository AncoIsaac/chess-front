// Tipos para las piezas
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PieceColor = "w" | "b";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

// Tipo para el tablero (8x8)
export type ChessBoard = (ChessPiece | null)[][];