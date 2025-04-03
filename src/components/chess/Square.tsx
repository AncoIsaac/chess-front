import style from "./style/Square.module.css";

interface SquareProps {
  color: string;
  onClick: () => void;
  isSelected: boolean;
  isCheck: boolean;
  isGameOver: boolean;
  isHighlighted?: boolean;
  isCapture?: boolean;
  children?: React.ReactNode;
}

const Square1 = ({
  color,
  onClick,
  isSelected,
  isCheck,
  isGameOver,
  isHighlighted = false,
  isCapture = false,
  children,
}: SquareProps) => {
  // Calculate dynamic styles
  const getSquareStyle = () => {
    let backgroundColor = color;
    
    if (isHighlighted) {
      backgroundColor = isCapture 
        ? `color-mix(in srgb, ${color} 60%, #ff0000)` // Red tint for captures
        : `color-mix(in srgb, ${color} 70%, #6b8e23)`; // Green tint for moves
    }
    
    return {
      backgroundColor,
      cursor: isGameOver ? 'default' : 'pointer',
      position: 'relative' as const,
    };
  };

  return (
    <button
      className={style.square}
      style={getSquareStyle()}
      onClick={isGameOver ? undefined : onClick}
      aria-label="Chess square"
      disabled={isGameOver}
    >
      {children}
      
      {/* Selection indicator */}
      {isSelected && <div className={style.selectedOverlay} />}
      
      {/* Check indicator */}
      {isCheck && <div className={style.checkIndicator} />}
      
      {/* Move indicator (only for empty squares) */}
      {isHighlighted && !isCapture && (
        <div className={style.moveIndicator} />
      )}
    </button>
  );
};

export default Square1;