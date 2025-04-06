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
    reason: "checkmate",
    isGameOver: false,
  });
  const [playerColor, setPlayerColor] = useState<PieceColor | null>(null);
  const [isDrawOffered, setIsDrawOffered] = useState(false);
  const [drawOfferedBy, setDrawOfferedBy] = useState<PieceColor | null>(null);

  // Socket connection
  const {
    socket,
    isConnected,
    opponentConnected,
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
      setGameResult({
        winner: game.turn() === "w" ? "b" : "w",
        reason: "checkmate",
        isGameOver: true,
      });
    } else if (game.isDraw()) {
      setGameResult({
        winner: null,
        reason: getDrawReason(),
        isGameOver: true,
      });
    } else if (game.isCheck()) {
      setGameResult({
        winner: null,
        reason: "check",
        isGameOver: false,
      });
    } else {
      setGameResult({
        winner: null,
        reason: "checkmate",
        isGameOver: false,
      });
    }
  }, [game]);

  // Determine draw reason
  const getDrawReason = (): GameResult["reason"] => {
    if (game.isStalemate()) return "stalemate";
    if (game.isThreefoldRepetition()) return "threefold_repetition";
    if (game.isInsufficientMaterial()) return "insufficient_material";
    if (game.isDraw()) return "fifty_move_rule";
    return "fifty_move_rule";
  };

  // Initialize board and socket listeners
  useEffect(() => {
    updateBoard();

    if (!socket) return;

    const handleGameState = (gameData: { fen: string; playerColor?: PieceColor, secondPlayerId: string }) => {
      game.load(gameData.fen);
      if (gameData.playerColor) setPlayerColor(gameData.playerColor);
      updateBoard();
    };

    const handleMoveMade = (updatedGame: { fen: string }) => {
      game.load(updatedGame.fen);
      updateBoard();
      setOpponentConnected(true);
    };

    const handleGameResigned = (result: { winner: 'w' | 'b', reason: string }) => {
      setGameResult({
        winner: result.winner,
        reason: result.reason as "check" | "checkmate" | "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",
        isGameOver: true
      });
      updateBoard();
    };

    const handleDrawOffered = (data: { by: 'w' | 'b' }) => {
      setIsDrawOffered(true);
      setDrawOfferedBy(data.by);
    };

    const handleGameEnded = (result: { winner: 'w' | 'b' | null, reason: string }) => {
      setGameResult({
        winner: result.winner,
        reason: result.reason as "check" | "checkmate" | "stalemate" | "threefold_repetition" | "insufficient_material" | "fifty_move_rule",

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
    socket.on('opponentConnected', (data) => {
      console.log('¡El oponente se ha conectado!', data);
      // Actualizar el estado de tu aplicación
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
      }
      return;
    }

    // Second click - make move
    try {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: "q",
      };

      const tempGame = new Chess(game.fen());
      const result = tempGame.move(move);

      if (!result) throw new Error("Invalid move");
      if (game.turn() !== playerColor) throw new Error("Not your turn");

      emitMove(move);
      game.move(move);
      updateBoard();
    } catch (error) {
      console.error("Move error:", error);
      emitError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSelectedSquare(square);
    }
  };

  // Reset game to initial state
  const resetGame = useCallback(() => {
    game.reset();
    updateBoard();
    setGameResult({
      winner: null,
      reason: "checkmate",
      isGameOver: false,
    });
    setSelectedSquare(null);
    setIsDrawOffered(false);
    setDrawOfferedBy(null);
    setOpponentConnected(false)
  }, [game, updateBoard]);

  // Handle resign
  const handleResign = useCallback(() => {
    if (!playerColor || gameResult.isGameOver) return;
    resignGame();
  }, [playerColor, gameResult, resignGame]);

  // Handle offer draw
  const handleOfferDraw = useCallback(() => {
    if (!playerColor || gameResult.isGameOver) return;
    offerDraw();
    setIsDrawOffered(true);
    setDrawOfferedBy(playerColor);
  }, [playerColor, gameResult, offerDraw]);

  // Handle accept draw
  const handleAcceptDraw = useCallback(() => {
    if (!isDrawOffered || gameResult.isGameOver) return;
    acceptDraw();
    setIsDrawOffered(false);
    setDrawOfferedBy(null);
  }, [isDrawOffered, gameResult, acceptDraw]);

  return {
    // Board state
    board,
    currentTurn,
    selectedSquare,

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
