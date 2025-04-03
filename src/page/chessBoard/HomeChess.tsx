import { useState } from "react";
import Board from "./components/Board";
import useChessGame from "../../hooks/useChessGame";
import GameStatus from "../../components/chess/GameStatus";

const HomeChess = () => {
  const gameId = "8fa94e03-bfa0-417c-93c8-7dce6d4d2093";
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
    offerDraw,
    resignGame,
  } = useChessGame(gameId);


  const [isDrawOffered, setIsDrawOffered] = useState(false);

  const handleOfferDraw = () => {
    offerDraw();
    setIsDrawOffered(true);
    setTimeout(() => setIsDrawOffered(false), 5000); // Reset after 5 seconds
  };

  const handleResign = () => {
    if (window.confirm("Are you sure you want to resign?")) {
      resignGame();
    }
  };

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
    };
    return reasons[reason] || reason;
  };


  return (
    <div className="w-full flex flex-col md:flex-row gap-4 p-4 max-w-6xl mx-auto">
      {/* Chess Board Section */}
      <div className="flex-1">
        <div className="relative bg-white rounded-lg shadow overflow-hidden">
          <Board
            isPlay={true}
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
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg text-center max-w-md w-full mx-4">
                {!isConnected && (
                  <div className="space-y-4">
                    <p className="text-lg">Connecting to server...</p>
                    <div className="animate-pulse">🔄</div>
                  </div>
                )}
                
                {isConnected && !opponentConnected && (
                  <div className="space-y-4">
                    <p className="text-lg">Waiting for opponent to join...</p>
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-2xl">
                        Your color: {playerColor === 'w' ? '⚪ White' : '⚫ Black'}
                      </span>
                    </div>
                    <div className="animate-pulse">👀</div>
                  </div>
                )}
                
                {gameResult?.isGameOver && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                      {gameResult.winner
                        ? `🏆 ${gameResult.winner === "w" ? "White wins!" : "Black wins!"}`
                        : "🤝 Game drawn!"}
                    </h2>
                    <p className="text-gray-600">
                      {formatDrawReason(gameResult.reason)}
                    </p>
                    <button
                      onClick={() => resetGame()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
                )}
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
            📜 Move History
            <span className="text-sm font-normal text-gray-500">
              ({game.history().length} moves)
            </span>
          </h2>
          <div className="h-64 overflow-y-auto pr-2">
            {game.history().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No moves yet. Make the first move!
              </p>
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
            🎮 Game Controls
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => resetGame()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              disabled={!opponentConnected}
            >
              <span>🔄</span> Reset
            </button>
            
            <button
              onClick={handleOfferDraw}
              className={`${isDrawOffered ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1`}
              disabled={!opponentConnected || gameResult?.isGameOver}
            >
              <span>🤝</span> {isDrawOffered ? "Offered" : "Draw"}
            </button>
            
            <button
              onClick={handleResign}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              disabled={!opponentConnected || gameResult?.isGameOver}
            >
              <span>🏳️</span> Resign
            </button>
          </div>
          
          {/* Game Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Your color:</span>
              <span className="text-lg">
                {playerColor === 'w' ? '⚪ White' : '⚫ Black'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium">Game status:</span>
              <span className="text-sm">
                {!isConnected ? "Connecting..." :
                 !opponentConnected ? "Waiting..." :
                 gameResult?.isGameOver ? "Finished" : "In progress"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeChess;