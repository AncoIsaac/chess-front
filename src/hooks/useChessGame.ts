import { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { ChessBoard, PieceColor, PieceType, GameResult } from "../types/chessTypes";
import useChessSocket from "./useChessSocket";
import { toast } from "react-toastify";

const useChessGame = (gameId: string) => {
  // Game state
  const [game] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<ChessBoard>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("w");
  const [gameResult, setGameResult] = useState<GameResult>({
    winner: null,
    reason: "stalemate" as "check" | "checkmate" | "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",
    isGameOver: false,
  });
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [isDrawOffered, setIsDrawOffered] = useState(false);
  const [drawOfferedBy, setDrawOfferedBy] = useState<PieceColor | null>(null);

  // Socket connection
  const {
    socket,
    isConnected,
    opponentConnected,
    playerColor,
    setOpponentConnected,
    emitMove,
    emitError,
    resignGame,
    offerDraw,
    acceptDraw
  } = useChessSocket(gameId);

  // Update board state from game FEN
  const updateBoard = useCallback(() => {
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
    checkGameResult();
  }, [game]);

  // Check game status (checkmate, draw, etc.)
  const checkGameResult = useCallback(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "b" : "w";
      setGameResult({
        winner,
        reason: "checkmate",
        isGameOver: true,
      });
      
      // Notificar al usuario si ganó o perdió
      if (playerColor === winner) {
        toast.success("¡Has ganado por jaque mate!");
      } else {
        toast.error("¡Has perdido por jaque mate!");
      }
    } else if (game.isDraw()) {
      setGameResult({
        winner: null,
        reason: getDrawReason() as "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",
        isGameOver: true,
      });
      toast.info(`¡Empate por ${getDrawReason()}!`);
    } else if (game.isCheck()) {
      setGameResult({
        winner: null,
        reason: "check",
        isGameOver: false,
      });
      toast.warning("¡Jaque!");
    } else {
      setGameResult({
        winner: null,
        reason: getDrawReason() as "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",
        isGameOver: false,
      });
    }
  }, [game, playerColor]);

  // Determine draw reason
  const getDrawReason = (): string => {
    if (game.isStalemate()) return "ahogado";
    if (game.isThreefoldRepetition()) return "triple repetición";
    if (game.isInsufficientMaterial()) return "material insuficiente";
    if (game.isDraw()) return "regla de los 50 movimientos";
    return "acuerdo mutuo";
  };

  // Calculate valid moves for selected piece
  const calculateValidMoves = useCallback((square: Square) => {
    return game.moves({
      square,
      verbose: true
    }).map(move => move.to as Square);
  }, [game]);

  // Initialize board and socket listeners
  useEffect(() => {
    updateBoard();

    if (!socket) return;

    const handleGameState = (gameData: { fen: string; playerColor?: PieceColor }) => {
      game.load(gameData.fen);
      updateBoard();
    };

    const handleMoveMade = (updatedGame: { fen: string }) => {
      game.load(updatedGame.fen);
      updateBoard();
      setSelectedSquare(null);
      setValidMoves([]);
      setOpponentConnected(true);
    };

    const handleGameResigned = (result: { winner: 'w' | 'b', reason: string }) => {
      setGameResult({
        winner: result.winner,
        reason: result.reason as any,
        isGameOver: true
      });
      updateBoard();
    };

    const handleDrawOffered = (data: { by: 'w' | 'b' }) => {
      setIsDrawOffered(true);
      setDrawOfferedBy(data.by);
      toast.info(`¡El oponente ha ofrecido tablas!`);
    };

    const handleGameEnded = (result: { winner: 'w' | 'b' | null, reason: string }) => {
      setGameResult({
        winner: result.winner,
        reason: result.reason as any,
        isGameOver: true
      });
      setIsDrawOffered(false);
      updateBoard();
    };

    socket.on("gameState", handleGameState);
    socket.on("moveMade", handleMoveMade);
    socket.on("gameResigned", handleGameResigned);
    socket.on("drawOffered", handleDrawOffered);
    socket.on("gameEnded", handleGameEnded);
    socket.on('opponentConnected', () => {
      setOpponentConnected(true);
      toast.success('¡El oponente se ha unido al juego!');
    });

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("moveMade", handleMoveMade);
      socket.off("gameResigned", handleGameResigned);
      socket.off("drawOffered", handleDrawOffered);
      socket.off("gameEnded", handleGameEnded);
    };
  }, [socket, game, updateBoard, setOpponentConnected]);

  // Handle square selection and piece movement
  const handleSquareClick = (row: number, col: number) => {
    if (gameResult.isGameOver || !isConnected || !playerColor) return;

    const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;

    // First click - select piece
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        setValidMoves(calculateValidMoves(square));
      }
      return;
    }

    // Second click - make move
    try {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: "q", // Always promote to queen for simplicity
      };

      // Validate move locally first
      const tempGame = new Chess(game.fen());
      const result = tempGame.move(move);

      if (!result) throw new Error("Movimiento inválido");
      if (game.turn() !== playerColor) throw new Error("No es tu turno");

      // Send move to server
      emitMove(move);
      
      // Update local game state
      game.move(move);
      updateBoard();
      setSelectedSquare(null);
      setValidMoves([]);

    } catch (error) {
      console.error("Move error:", error);
      emitError(error instanceof Error ? error.message : "Error desconocido");
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Reset game to initial state
  const resetGame = useCallback(() => {
    game.reset();
    updateBoard();
    setGameResult({
      winner: null,
      reason: getDrawReason() as "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",
      isGameOver: false,
    });
    setSelectedSquare(null);
    setValidMoves([]);
    setIsDrawOffered(false);
    setDrawOfferedBy(null);
  }, [game, updateBoard]);

  // Handle resign
  const handleResign = useCallback(() => {
    if (!playerColor || gameResult.isGameOver) return;
    resignGame();
    toast.info("Te has rendido");
  }, [playerColor, gameResult, resignGame]);

  // Handle offer draw
  const handleOfferDraw = useCallback(() => {
    if (!playerColor || gameResult.isGameOver) return;
    offerDraw();
    setIsDrawOffered(true);
    setDrawOfferedBy(playerColor);
    toast.info("Has ofrecido tablas");
  }, [playerColor, gameResult, offerDraw]);

  // Handle accept draw
  const handleAcceptDraw = useCallback(() => {
    if (!isDrawOffered || gameResult.isGameOver) return;
    acceptDraw();
    setIsDrawOffered(false);
    setDrawOfferedBy(null);
    toast.success("Has aceptado las tablas");
  }, [isDrawOffered, gameResult, acceptDraw]);

  return {
    // Board state
    board,
    currentTurn,
    selectedSquare,
    validMoves,

    // Game status
    gameResult,
    isConnected,
    playerColor,
    opponentConnected,
    isDrawOffered,
    drawOfferedBy,

    // Actions
    handleSquareClick,
    resetGame,
    handleResign,
    handleOfferDraw,
    handleAcceptDraw,

    // Expose for debugging/advanced use
    game,
  };
};

export default useChessGame;