import style from "./style/Square.module.css";

interface SquareProps {
  color: string;
  onClick: () => void;
  isSelected: boolean;
  isCheck: boolean;
  isGameOver: boolean;
  children?: React.ReactNode;
}

const Square1 = ({
  color,
  onClick,
  isSelected,
  isCheck,
  isGameOver,
  children,
}: SquareProps) => {
  return (
    <button
      className={style.square}
      style={{
        backgroundColor: color,
        position: "relative", // Asegura que los elementos absolutos se posicionen correctamente
      }}
      onClick={isGameOver ? undefined : onClick}
    >
      {children}
      {isSelected && <div className={style.selectedOverlay} />}
      {isCheck && (
        <>
          <div className={style.checkKingIndicator}>🔥</div>
        </>
      )}
     
    </button>
  );
};

export default Square1;