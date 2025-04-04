import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const useChessSocket = (gameId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  // Initialize socket and listeners
  useEffect(() => {
    if (!gameId) return;

    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(newSocket);

    const onConnect = () => {
      setIsConnected(true);
      newSocket.emit("joinGame", gameId);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setOpponentConnected(false);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.disconnect();
    };
  }, [gameId]);

  // Emit move to server
  const emitMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      if (!socket || !isConnected) return;
      socket.emit("makeMove", { gameId, move });
    },
    [socket, isConnected, gameId]
  );

  // Emit error to server
  const emitError = useCallback(
    (error: string) => {
      if (!socket || !isConnected) return;
      socket.emit("moveError", error);
    },
    [socket, isConnected]
  );

  // Emit resign game
  const resignGame = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit("resignGame", gameId);
  }, [socket, isConnected, gameId]);

  // Emit offer draw
  const offerDraw = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit("offerDraw", gameId);
  }, [socket, isConnected, gameId]);

  // Emit accept draw
  const acceptDraw = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit("acceptDraw", gameId);
  }, [socket, isConnected, gameId]);

  return {
    socket,
    isConnected,
    opponentConnected,
    setOpponentConnected,
    emitMove,
    emitError,
    resignGame,
    offerDraw,
    acceptDraw,
  };
};

export default useChessSocket;