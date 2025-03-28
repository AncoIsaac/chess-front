import Board from "./components/Board";
import useChessGame from "../../hooks/useChessGame";
import style from "./style/Chess.module.css";

const HomeChess = () => {
  const {
    board,
    handleSquareClick,
    selectedSquare,
    currentTurn,
    gameResult,
    resetGame,
    game,
  } = useChessGame();

  const formatDrawReason = (reason: string) => {
    const reasons: Record<string, string> = {
      stalemate: "ahogado",
      threefold_repetition: "triple repetición",
      insufficient_material: "material insuficiente",
      fifty_move_rule: "regla de los 50 movimientos",
      draw: "empate",
    };
    return reasons[reason] || reason;
  };

  return (
    <div className="w-full flex  gap-1 ">
      <div className="relative">
        <Board
          game={game}
          board={board}
          handleSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          currentTurn={currentTurn}
          gameResult={gameResult}
        />
        {gameResult?.isGameOver && (
          <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-2">
                {gameResult.winner
                  ? `¡Ganaron las ${
                      gameResult.winner === "w" ? "Blancas" : "Negras"
                    }!`
                  : "¡Empate!"}
              </h2>
              <p className="mb-4">
                {gameResult.winner
                  ? "Por jaque mate"
                  : `Por ${formatDrawReason(gameResult.reason)}`}
              </p>
              <button
                onClick={resetGame}
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
          <h2 className="text-2xl font-semibold  py-.5 px-2">Movimientos</h2>
          <ul className="list-disc overflow-y-auto max-h-64">
            {game.history({ verbose: true }).map((move, index) => (
              <li key={index} className="flex items-center gap-4 py-1 px-2">
                <span className="w-8 flex justify-center">
                  {index % 2 === 0 ? "⚪" : "⚫"}
                </span>
                <span className="w-24 text-center">{move.san}</span>
                <span className="w-32 text-center">
                  {index % 2 === 0 ? "Jugador 1" : "Jugador 2"}
                </span>
              </li>
            ))}
          </ul>
        </section>
       

        <div className="flex flex-col gap-8 items-center">
          <button
            onClick={resetGame}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeChess;
