import style from "./style/TimerCom.module.css";
import { useEffect, useState } from "react";

type TimerProps = {
  isActive: boolean;
  time: number;
  color?: "white" | "black";
  isPlayerTurn?: boolean;
  className?: string;

};

const TimerCom = ({ 
  isActive, 
  time, 
  color = "white", 
  isPlayerTurn = false,
  className = "",
}: TimerProps) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle low time warning effects
  useEffect(() => {
      if (time <= 10 && isActive) {
        setIsCritical(true);
        
        if (time <= 5) {
          const blinkInterval = setInterval(() => {
            setIsBlinking(prev => !prev);
          }, 500);
          
          return () => clearInterval(blinkInterval);
        } else {
          setIsBlinking(false);
        }
      } else {
        setIsCritical(false);
        setIsBlinking(false);
      }
  }, [time, isActive]); // Asegúrate de que estas son todas las dependencias necesarias

  // Determine timer color based on props and state
  const getTimerColorClass = () => {
    if (color === "black") {
      if (isCritical) return style.blackCritical;
      if (isPlayerTurn) return style.blackActive;
      return style.blackInactive;
    } else {
      if (isCritical) return style.whiteCritical;
      if (isPlayerTurn) return style.whiteActive;
      return style.whiteInactive;
    }
  };

  return (
    <div className={`${style.timerWrapper} ${className}`}>
      {color === "black" && (
        <div className={style.playerIndicator}>⚫</div>
      )}
      
      <div
        className={`${style.timerDisplay} ${getTimerColorClass()} ${
          isBlinking ? style.blinking : ""
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime()}
        {isCritical && <div className={style.pulseEffect} />}
      </div>
      
      {color === "white" && (
        <div className={style.playerIndicator}>⚪</div>
      )}
    </div>
  );
};

export default TimerCom;