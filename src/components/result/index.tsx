import { ResultKind } from "./logic";
import "./style.css";

function Result(props: {
  result: ResultKind,
  switchToMenu: () => void
}) {
  return (
    <div className="result-wrapper">
      <div className="result-label">
        {
          props.result === "clear"
          ? "CLEAR!!!"
          : "GAMEOVER..."
        }
      </div>
      <button 
        className="result-button"
        onClick={props.switchToMenu}
      >Top</button>
    </div>
  );
}

export default Result;