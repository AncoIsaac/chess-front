import Board from "./components/Board";
import useChessGame from "../../hooks/useChessGame";
import { useState } from "react";

const HomeChess = () => {
  const gameId = "1d38cd72-95da-4596-b007-01506edccc48"; // TODO: get from params or state
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
  } = useChessGame(gameId);

  console.log('isConnected', isConnected)
  console.log('opponentConnected', opponentConnected)
  
  const [isPlay, setIsPlay] = useState(false);
  
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

  // Determinar si es el turno del jugador actual
  const isPlayerTurn = currentTurn === playerColor;

  return (
    <div className="w-full flex gap-1">
      <div className="relative">
        {/* Mostrar estado de conexión y espera de oponente */}
        {!isConnected && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg">
              Conectando al servidor...
            </div>
          </div>
        )}
       
        
        {!opponentConnected && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg text-center">
              <p>Esperando al oponente...</p>
              <p>Tus piezas: {playerColor === 'w' ? 'Blancas ⚪' : 'Negras ⚫'}</p>
            </div>
          </div>
        )}
        <Board
          game={game}
          board={board}
          handleSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          currentTurn={currentTurn}
          gameResult={gameResult}
          isPlay={isPlay && opponentConnected} // Solo permitir jugar si hay oponente
          resetGame={resetGame}
          playerColor={playerColor}
        />
        
        {gameResult?.isGameOver && (
          <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-2">
                {gameResult.winner
                  ? `¡Ganaron las ${
                      gameResult.winner === "w" ? "Blancas ⚪" : "Negras ⚫"
                    }!`
                  : "¡Empate!"}
              </h2>
              <p className="mb-4">
                {gameResult.reason === "checkmate"
                  ? "Por jaque mate"
                  : `Por ${formatDrawReason(gameResult.reason)}`}
              </p>
              <button
                onClick={() => {
                  resetGame();
                  setIsPlay(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Jugar otra vez
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full">
        <section className="h-72">
          <h2 className="text-2xl font-semibold py-.5 px-2">Movimientos</h2>
          <ul className="list-disc overflow-y-auto max-h-64">
            {game.history({ verbose: true }).map((move, index) => (
              <li key={index} className="flex items-center gap-4 py-1 px-2">
                <span className="w-8 flex justify-center">
                  {index % 2 === 0 ? "⚪" : "⚫"}
                </span>
                <span className="w-24 text-center">{move.san}</span>
                <span className="w-32 text-center">
                  {index % 2 === 0 ? 
                    (playerColor === 'w' ? 'Tú' : 'Oponente') : 
                    (playerColor === 'b' ? 'Tú' : 'Oponente')}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-8 items-center pt-5">
          {/* Mostrar de quién es el turno actual */}
          <div className={`text-lg font-semibold ${
            isPlayerTurn ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPlayerTurn ? '¡Es tu turno!' : 'Turno del oponente'}
          </div>
          
          <button
            onClick={() => {
              resetGame();
              setIsPlay(false);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
          >
            Reiniciar
          </button>
          
          <button
            onClick={() => {
              setIsPlay(!isPlay);
              if (!isPlay) resetGame();
            }}
            className={`${
              isPlay
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white px-4 py-1 rounded`}
            disabled={!opponentConnected && isConnected} // Deshabilitar si no hay oponente
          >
            {isPlay ? "Cancelar" : "Jugar"}
          </button>
          
          {/* Mostrar información del jugador */}
          {playerColor && (
            <div className="mt-4 text-center">
              <p className="font-semibold">Tus piezas:</p>
              <p className="text-2xl">{playerColor === 'w' ? '⚪ Blancas' : '⚫ Negras'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeChess;