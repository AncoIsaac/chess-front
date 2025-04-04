import Board from "./components/Board";
import useChessGame from "../../hooks/useChessGame";
import { useState } from "react";
import { toast } from "react-toastify";
import GameStatus from "../../components/chess/GameStatus";
import { Play } from "lucide-react";
import useGetData from "../../server/hook/useGetData";
import { getOnlyGameI } from "../../interface/game/getOnlyGame";
import { usePost } from "../../server/hook/usePost";

const HomeChess = () => {
  const [gameId, setGetGameId] = useState<string | null>(null);
  const [play, setPlay] = useState<boolean>(false);

  const {
    board,
    handleSquareClick,
    selectedSquare,
    currentTurn,
    gameResult,
    resetGame,
    game,
    playerColor,
    opponentConnected,
    isConnected,
    handleResign,
    handleOfferDraw,
    handleAcceptDraw,
    isDrawOffered,
    drawOfferedBy
  } = useChessGame(gameId ? gameId : "");

  const { data, error, isLoading, mutate } = useGetData<getOnlyGameI>(
    gameId ? `games/${gameId}` : ""
  );

  const { trigger } = usePost<{ firstPlayerId: string }, any>("games");

  const formatDrawReason = (reason: string) => {
    const reasons: Record<string, string> = {
      stalemate: "ahogado",
      threefold_repetition: "triple repetición",
      insufficient_material: "material insuficiente",
      fifty_move_rule: "regla de los 50 movimientos",
      draw: "empate",
      timeout: "tiempo agotado",
      checkmate: "jaque mate",
      check: "jaque",
      resignation: "rendición",
      agreement: "acuerdo mutuo"
    };
    return reasons[reason] || reason;
  };

  const handleResignClick = () => {
    if (window.confirm("¿Estás seguro de que quieres rendirte?")) {
      handleResign();
      toast.info("Te has rendido");
    }
  };

  const handleOfferDrawClick = () => {
    handleOfferDraw();
    toast.info("Has ofrecido tablas");
  };

  const handleAcceptDrawClick = () => {
    handleAcceptDraw();
    toast.info("Has aceptado las tablas");
  };

  const handlePlay = async () => {
    const player = localStorage.getItem("idUser");
    try {
      const response = await trigger({
        firstPlayerId: player || "",
      });
      setGetGameId(response.data.id);
      setPlay(true);
      toast.info("Partida creada. Esperando oponente...");
    } catch (error) {
      toast.error(`Error al crear la partida: ${error}`);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 p-4 max-w-6xl mx-auto">
      {/* Chess Board Section */}
      <div className="flex-1">
        <div className="relative bg-white rounded-lg shadow overflow-hidden">
          <Board
            isPlay={play}
            resetGame={resetGame}
            board={board}
            handleSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
            currentTurn={currentTurn}
            gameResult={gameResult}
            game={game}
            playerColor={playerColor}
          />

          {/* Connection/Game Status Overlay */}
          {(!isConnected || !opponentConnected || gameResult?.isGameOver) && (
            <div className="absolute inset-0  bg-opacity-70 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg text-center max-w-md w-full mx-4">
                {!isConnected && (
                  <div className="space-y-4">
                    <p className="text-lg">Conectando al servidor...</p>
                    <div className="animate-pulse">🔄</div>
                  </div>
                )}

                {isConnected && !opponentConnected && (
                  <div className="space-y-4">
                    <p className="text-lg">Esperando oponente...</p>
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-2xl">
                        Tu color:{" "}
                        {playerColor === "w" ? "⚪ Blancas" : "⚫ Negras"}
                      </span>
                    </div>
                    <div className="animate-pulse">👀</div>
                  </div>
                )}

                {gameResult?.isGameOver && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                      {gameResult.winner
                        ? `🏆 ${
                            gameResult.winner === "w"
                              ? "¡Blancas ganan!"
                              : "¡Negras ganan!"
                          }`
                        : "🤝 ¡Empate!"}
                    </h2>
                    <p className="text-gray-600">
                      {formatDrawReason(gameResult.reason)}
                    </p>
                    <button
                      onClick={() => resetGame()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Jugar de nuevo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Draw Offer Modal */}
          {isDrawOffered && drawOfferedBy !== playerColor && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
              <div className="bg-white p-6 rounded-lg text-center max-w-sm w-full mx-4">
                <h3 className="text-xl font-bold mb-4">
                  ¡Oponente ofrece tablas!
                </h3>
                <p className="mb-4">¿Aceptas el empate?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleAcceptDrawClick}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => toast.info("Has rechazado las tablas")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Info Section */}
      <div className="flex-1 max-w-md space-y-4">
        {/* Game Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <GameStatus
            currentTurn={currentTurn}
            playerColor={playerColor}
            gameResult={gameResult}
            isConnected={isConnected}
            opponentConnected={opponentConnected}
          />
        </div>

        {/* Move History */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            📜 Historial de movimientos
            <span className="text-sm font-normal text-gray-500">
              ({gameResult?.isGameOver ? data?.moves?.length : game.history().length} movimientos)
            </span>
          </h2>
          <div className="h-64 overflow-y-auto pr-2">
            {gameResult?.isGameOver ? (
              data?.moves && data.moves.length > 0 ? (
                <div className="grid grid-cols-2 gap-1">
                  {Array.from({ length: Math.ceil(data.moves.length / 2) }).map((_, i) => (
                    <div key={i} className="grid grid-cols-3 gap-1 items-center">
                      <span className="text-gray-500 text-right pr-2">{i + 1}.</span>
                      <span className="px-2 py-1 hover:bg-gray-50 rounded">
                        {data.moves[i * 2]}
                      </span>
                      {data.moves[i * 2 + 1] && (
                        <span className="px-2 py-1 hover:bg-gray-50 rounded">
                          {data.moves[i * 2 + 1]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay movimientos registrados</p>
              )
            ) : game.history().length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay movimientos aún. ¡Haz el primer movimiento!</p>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: Math.ceil(game.history().length / 2) }).map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-1 items-center">
                    <span className="text-gray-500 text-right pr-2">{i + 1}.</span>
                    <span className="px-2 py-1 hover:bg-gray-50 rounded">
                      {game.history()[i * 2]}
                    </span>
                    {game.history()[i * 2 + 1] && (
                      <span className="px-2 py-1 hover:bg-gray-50 rounded">
                        {game.history()[i * 2 + 1]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            🎮 Controles del juego
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => resetGame()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              disabled={!opponentConnected || gameResult?.isGameOver}
            >
              <span>🔄</span> Reiniciar
            </button>

            <button
              onClick={handleOfferDrawClick}
              className={`${
                isDrawOffered
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1`}
              disabled={!opponentConnected || gameResult?.isGameOver || isDrawOffered}
            >
              <span>🤝</span> {isDrawOffered ? "Tablas ofrecidas" : "Ofrecer tablas"}
            </button>

            <button
              onClick={handleResignClick}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              disabled={!opponentConnected || gameResult?.isGameOver}
            >
              <span>🏳️</span> Rendirse
            </button>

            <button
              onClick={handlePlay}
              className="bg-green-500 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              disabled={!!gameId && !gameResult?.isGameOver}
            >
              <Play size={18} /> {gameId ? "Reanudar" : "Nueva partida"}
            </button>
          </div>

          {/* Game Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tu color:</span>
              <span className="text-lg">
                {playerColor === "w" ? "⚪ Blancas" : "⚫ Negras"}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium">Estado:</span>
              <span className="text-sm">
                {!isConnected
                  ? "Conectando..."
                  : !opponentConnected
                  ? "Esperando oponente..."
                  : gameResult?.isGameOver
                  ? "Partida terminada"
                  : "En progreso"}
              </span>
            </div>
            {isDrawOffered && drawOfferedBy === playerColor && (
              <div className="mt-2 text-sm text-yellow-600">
                Esperando respuesta del oponente a tu oferta de tablas...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeChess;