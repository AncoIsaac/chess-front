import style from "./style/Square.module.css";

interface SquareProps {
  color: string;
  onClick: () => void;
  isSelected: boolean;
  isCheck: boolean;
  isGameOver: boolean;
  isHighlighted?: boolean; // Nueva prop para movimientos válidos
  children?: React.ReactNode;
}

const Square1 = ({
  color,
  onClick,
  isSelected,
  isCheck,
  isGameOver,
  isHighlighted = false, // Valor por defecto
  children,
}: SquareProps) => {
  return (
    <button
      className={style.square}
      style={{
        backgroundColor: isHighlighted 
          ? `color-mix(in srgb, ${color} 70%, #6b8e23)` 
          : color,
        position: "relative",
      }}
      onClick={isGameOver ? undefined : onClick}
    >
      {children}
      {isSelected && <div className={style.selectedOverlay} />}
      {isCheck && <div className={style.checkKingIndicator}>🔥</div>}
    </button>
  );
};

export default Square1;