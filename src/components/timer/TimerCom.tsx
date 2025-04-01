import style from "./style/TimerCom.module.css";

type timerProps = {
  isActive: boolean;
  time: number;
};

const TimerCom = ({ isActive, time }: timerProps) => {
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={style.timerWrapper}>
      <div
        className={`${style.timerDisplay} ${
          time <= 10 && isActive ? style.timeLow : ""
        }`}
      >
        {formatTime()}
      </div>
    </div>
  );
};

export default TimerCom;
