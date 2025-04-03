export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type GameStatus = 
  | 'waiting' 
  | 'in_progress' 
  | 'finished' 
  | 'abandoned' 
  | 'draw_offered';

export type GameEndReason = 
  | 'checkmate'
  | 'stalemate'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'fifty_move_rule'
  | 'timeout'
  | 'resignation'
  | 'agreement'
  | 'abandonment';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean; // Useful for castling and pawn moves
}

export type ChessBoard = (ChessPiece | null)[][];

export interface GameResult {
  winner: PieceColor | null;
  reason: GameEndReason;
  isGameOver: boolean;
}

export interface GameMove {
  from: string;
  to: string;
  promotion?: PieceType;
  san: string; // Standard Algebraic Notation
  flags: string;
  piece: PieceType;
  color: PieceColor;
}

export interface Player {
  id: string;
  color: PieceColor;
  timeLeft: number; // in seconds
  isConnected: boolean;
}

export interface GameState {
  board: ChessBoard;
  status: GameStatus;
  currentTurn: PieceColor;
  result: GameResult | null;
  moves: GameMove[];
  fen: string;
  pgn: string;
  players: {
    white: Player;
    black: Player;
  };
  lastMove?: {
    from: string;
    to: string;
  };
  drawOfferedBy?: PieceColor | null;
}

// For socket events
export interface SocketGameEvent {
  type: 'move' | 'draw_offer' | 'resign' | 'time_update';
  payload: unknown;
  timestamp: number;
}

export interface MoveEvent extends SocketGameEvent {
  type: 'move';
  payload: GameMove;
}

export interface DrawOfferEvent extends SocketGameEvent {
  type: 'draw_offer';
  payload: {
    by: PieceColor;
  };
}