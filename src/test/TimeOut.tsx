import { useState, useEffect } from "react";
import style from "./test.module.css";

const TimeOut = () => {
  const [timeLeft, setTimeLeft] = useState(1 * 60);
  const [isActive, setIsActive] = useState(false);


  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (interval) clearInterval(interval);
      // Efecto visual cuando termina el tiempo
      const timerDisplay = document.querySelector(`.${style.timerDisplay}`);
      if (timerDisplay) timerDisplay.classList.add(style.timeEnd);

      setTimeout(() => {
        const timerDisplay = document.querySelector(`.${style.timerDisplay}`);
        if (timerDisplay) timerDisplay.classList.remove(style.timeEnd);
      }, 1000);

      resetTimer()
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(1 * 60);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={style.timerContainer}>
      <div className={style.timerWrapper}>
        <h1 className={style.timerDisplay}>{formatTime()}</h1>
        <div className={style.progressBar}>
          <div
            className={style.progressFill}
            style={{ width: `${(timeLeft / (5 * 60)) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className={style.buttonGroup}>
        {!isActive  ? (
          <button
            className={`${style.button} ${style.startButton}`}
            onClick={startTimer}
          >
            <span className={style.buttonIcon}>▶</span> Iniciar
          </button>
        ) : (
          <button
            className={`${style.button} ${style.pauseButton}`}
            onClick={pauseTimer}
          >
            <span className={style.buttonIcon}>⏸</span> Pausar
          </button>
        )}
        <button
          className={`${style.button} ${style.resetButton}`}
          onClick={resetTimer}
        >
          <span className={style.buttonIcon}>↻</span> Reiniciar
        </button>
      </div>
    </div>
  );
};

export default TimeOut;
