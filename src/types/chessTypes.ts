
export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (ChessPiece | null)[][];

export type GameResult = {
  winner: PieceColor | null;
  reason: 
    | "check"
    | "checkmate" 
    | "stalemate" 
    | "threefold_repetition" 
    | "insufficient_material" 
    | "fifty_move_rule";
  isGameOver: boolean;
};