interface SquareProps {
    color: string;
    onClick: () => void;
    isSelected: boolean;
    children?: React.ReactNode;
  }
  
  const Square = ({ color, onClick, isSelected, children }: SquareProps) => {
    
    return (
      <button
        style={{
          width: "50px",
          height: "50px",
          backgroundColor: isSelected ? "#ffff00" : color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };
  
  export default Square;