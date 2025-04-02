import { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { io, Socket } from "socket.io-client";
import {
  ChessBoard,
  PieceColor,
  PieceType,
  GameResult,
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<PieceColor | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);

  // Función para actualizar el tablero
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

  // Configuración del socket y listeners
  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log('connect')
      setIsConnected(true);
      newSocket.emit("joinGame", gameId);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("gameState", (gameData) => {
      game.load(gameData.fen);
      if (gameData.playerColor) {
        setPlayerColor(gameData.playerColor);
      }
      updateBoard();

      // Verificar si el oponente está conectado
      if (
        gameData.fen !==
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      ) {
        setOpponentConnected(true);
      }
    });

    newSocket.on("moveMade", (updatedGame) => {
      game.load(updatedGame.fen);
      updateBoard();
      setOpponentConnected(true); // Si recibimos un movimiento, el oponente está conectado
    });

    newSocket.on("moveError", (error) => {
      console.error("Error en el movimiento:", error);
      // Forzar actualización para revertir cambios visuales
      updateBoard();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, game, updateBoard]);

  // Inicializar el tablero
  useEffect(() => {
    updateBoard();
  }, [updateBoard]);

  const checkGameResult = () => {
    if (game.isCheckmate()) {
      setGameResult({
        winner: game.turn() === "w" ? "b" : "w",
        reason: "checkmate",
        isGameOver: true,
      });
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
  };

  const getDrawReason = (): string => {
    if (game.isStalemate()) return "stalemate";
    if (game.isThreefoldRepetition()) return "threefold_repetition";
    if (game.isInsufficientMaterial()) return "insufficient_material";
    return "fifty_move_rule";
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameResult?.isGameOver || !isConnected || !socket) return;

    const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;

    if (!selectedSquare) {
      const piece = game.get(square);
      // Solo permitir seleccionar piezas del color del jugador
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

        // Validación adicional: verificar que es el turno del jugador
        if (game.turn() !== playerColor) {
          throw new Error("No es tu turno");
        }

        const tempGame = new Chess(game.fen());
        const result = tempGame.move(move);
        
        if (!result) {
          throw new Error("Movimiento inválido");
        }

        socket.emit('makeMove', { gameId, move });
        game.move(move);
        updateBoard();
      }  catch (error) {
        console.error("Error en el movimiento:", error);
        if (error instanceof Error) {
          socket.emit('moveError', error.message);
        } else {
          socket.emit('moveError', 'An unknown error occurred');
        }
      } finally {
        setSelectedSquare(square);
      }
    }
  };

  const resetGame = (
    winner: PieceColor | null = null,
    reason: string = "reset"
  ) => {
    game.reset();
    updateBoard();

    if (winner !== null) {
      setGameResult({
        winner,
        reason: reason as any,
        isGameOver: true,
      });
    } else {
      setGameResult({
        winner: null,
        reason: "checkmate",
        isGameOver: false,
      });
    }

    setSelectedSquare(null);
  };

  return {
    board,
    handleSquareClick,
    selectedSquare,
    currentTurn,
    gameResult,
    resetGame,
    game,
    isConnected,
    playerColor,
    opponentConnected,
  };
};

export default useChessGame;
