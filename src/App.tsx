
// import Board from "./components/chess/Board";
// import useChessGame from "./hooks/useChessGame";
// import style from "./App.module.css";
// // import { UsersI } from "./interface/user/UsersI";
// // import useGetData from "./server/hook/useGetData";

import Router from "./router/Router"


function App() {
  // const { board, handleSquareClick, selectedSquare, currentTurn } = useChessGame();
  // const {data, isLoading, error, mutate} = useGetData<UsersI[]>(`Users`)
  

  // if(error) return <h1>Error</h1>

  return (
    <>
    <Router/>
    {/* <div className={style.center}>
      {data?.map((user) => {
        return <h1 key={user.id}>{user.userName}</h1>
      })}
 */}
    {/* </div> */}
      {/* <div className={style.center}>
      <p>Turno: {currentTurn === "w" ? "Blancas" : "Negras"}</p>
      <Board
        board={board}
        handleSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
      />
    </div> */}
    </>
  )
}

export default App
