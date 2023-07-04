import "./coins.css";
import { useEffect, useState } from "react";

const Coinflip: React.FC = () => {
  const [timeBeforeFlip, setTimeBeforeFlip] = useState<number>(3);
  const [coinClass, setCoinClass] = useState<string>("");
  const [coinFlipped, setCoinFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (timeBeforeFlip > 0) {
      const timer = setTimeout(() => {
        setTimeBeforeFlip((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeBeforeFlip === 0 && !coinFlipped) {
      const decidedSide = Math.random();
      console.log(decidedSide);
      setCoinFlipped(true);
      if (decidedSide > 0.5) {
        setCoinClass("animate-tails");
      } else {
        setCoinClass("animate-heads");
      }
      setTimeout(() => {
        setCoinClass("");
      }, 5000);
    }
  }, [timeBeforeFlip, coinFlipped]);

  return (
    <div className="box-container">
      <div className="box">
        <h1 className="timebeforecount" >{timeBeforeFlip}</h1>
        <div id={coinClass} className="coin">
          <div className="heads"></div>
          <div className="tails"></div>
        </div>
      </div>
    </div>
  );
};

export default Coinflip;
