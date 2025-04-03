import { useState, useEffect, useCallback, useRef } from "react";
import { Chess, Square } from "chess.js";
import { io, Socket } from "socket.io-client";
import {
  ChessBoard,
  PieceColor,
  PieceType,
  GameResult,
  GameStatus,
} from "../types/chessTypes";

const useChessGame = (gameId: string) => {
  const [game] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<ChessBoard>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>("w");
  const [gameResult, setGameResult] = useState<GameResult>({
    winner: null,
    reason: "checkmate",
    isGameOver: false,
  });
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<PieceColor | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized board update function
  const updateBoard = useCallback(() => {
    const newBoard: ChessBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

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

  // Check game result and update state
  const checkGameResult = useCallback(() => {
    if (game.isCheckmate()) {
      setGameResult({
        winner: game.turn() === "w" ? "b" : "w",
        reason: "checkmate",
        isGameOver: true,
      });
      setGameStatus("finished");
    } else if (game.isDraw()) {
      setGameResult({
        winner: null,
        reason: getDrawReason() as
          | "stalemate"
          | "threefold_repetition"
          | "insufficient_material"
          | "fifty_move_rule",
        isGameOver: true,
      });
      setGameStatus("finished");
    } else if (game.isCheck()) {
      setGameResult({
        winner: null,
        reason: "checkmate",
        isGameOver: false,
      });
      setGameStatus("in_progress");
    } else {
      setGameResult({
        winner: null,
        reason: "checkmate",
        isGameOver: false,
      });
      setGameStatus(game.history().length > 0 ? "in_progress" : "waiting");
    }
  }, [game]);

  const getDrawReason = (): string => {
    if (game.isStalemate()) return "stalemate";
    if (game.isThreefoldRepetition()) return "threefold_repetition";
    if (game.isInsufficientMaterial()) return "insufficient_material";
    return "fifty_move_rule";
  };

  // Handle square click and move logic
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameResult?.isGameOver || !isConnected || !socketRef.current) return;

      const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;

      if (!selectedSquare) {
        const piece = game.get(square);
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
        }
      } else {
        try {
          const move = {
            from: selectedSquare,
            to: square,
            promotion: "q",
          };

          if (game.turn() !== playerColor) {
            throw new Error("Not your turn");
          }

          const tempGame = new Chess(game.fen());
          const result = tempGame.move(move);

          if (!result) {
            throw new Error("Invalid move");
          }

          socketRef.current.emit("makeMove", { gameId, move });
          game.move(move);
          updateBoard();
        } catch (err) {
          const error = err instanceof Error ? err.message : "Invalid move";
          setError(error);
          setTimeout(() => setError(null), 3000);
        } finally {
          setSelectedSquare(null);
        }
      }
    },
    [
      game,
      gameId,
      gameResult,
      isConnected,
      playerColor,
      selectedSquare,
      updateBoard,
    ]
  );

  // Reset game state
  const resetGame = useCallback(
    (winner: PieceColor | null = null, reason: string = "reset") => {
      game.reset();
      updateBoard();

      setGameResult({
        winner,
        reason: reason as any,
        isGameOver: winner !== null,
      });
      setGameStatus(winner !== null ? "finished" : "waiting");
      setSelectedSquare(null);
    },
    [game, updateBoard]
  );

  // Offer draw function
  const offerDraw = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("offerDraw", { gameId });
    }
  }, [gameId, isConnected]);

  // Resign game function
  const resignGame = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("resignGame", { gameId });
      setGameStatus("finished");
      setGameResult({
        winner: playerColor === "w" ? "b" : "w",
        reason: "checkmate",
        isGameOver: true,
      });
    }
  }, [gameId, isConnected, playerColor]);

  // Socket connection and event handlers
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Y modifica el manejador de connect:
    const handleConnect = async () => {
      setIsConnected(true);
      const user = socket.emit("joinGame", {
        gameId,
        userId: localStorage.getItem("user"), // Asegúrate de pasar el ID del usuario
      });

      console.log("user", user);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setGameStatus("waiting" as GameStatus);
    };

    // Inside the useEffect socket setup:
    const handleGameState = (gameData: {
      fen: string;
      playerColor?: PieceColor;
      status?: GameStatus;
      opponentConnected?: boolean;
    }) => {
      game.load(gameData.fen);
      if (gameData.playerColor) {
        setPlayerColor(gameData.playerColor);
      }
      if (gameData.status) {
        setGameStatus(gameData.status);
      }
      // Always update opponentConnected if provided
      setOpponentConnected(gameData.opponentConnected ?? false);
      updateBoard();
    };

    const handlePlayerConnected = () => {
      setOpponentConnected(true);
      setGameStatus("in_progress");
    };

    const handlePlayerDisconnected = (data: { message: string }) => {
      setOpponentConnected(false);
      setGameStatus("abandoned");
      setError(data.message);
      setTimeout(() => setError(null), 5000);
    };

    const handleMoveError = (error: { message: string }) => {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("gameState", handleGameState);
    socket.on("playerConnected", handlePlayerConnected);
    socket.on("playerDisconnected", handlePlayerDisconnected);
    socket.on("moveMade", handleGameState);
    socket.on("moveError", handleMoveError);
    socket.on("drawOffered", () => {
      setError("Your opponent offered a draw");
      setTimeout(() => setError(null), 5000);
    });
    socket.on("drawAccepted", () => {
      setGameStatus("finished");
      setGameResult({
        winner: null,
        reason: "insufficient_material",
        isGameOver: true,
      });
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("gameState", handleGameState);
      socket.off("playerConnected", handlePlayerConnected);
      socket.off("playerDisconnected", handlePlayerDisconnected);
      socket.off("moveMade", handleGameState);
      socket.off("moveError", handleMoveError);
      socket.disconnect();
    };
  }, [gameId, game, updateBoard]);

  // Initialize board
  useEffect(() => {
    updateBoard();
  }, [updateBoard]);

  return {
    board,
    handleSquareClick,
    selectedSquare,
    currentTurn,
    gameResult,
    gameStatus,
    resetGame,
    game,
    isConnected,
    playerColor,
    opponentConnected,
    error,
    offerDraw,
    resignGame,
  };
};

export default useChessGame;
