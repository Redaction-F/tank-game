import { StageMap } from "./logic";
import Player from "../player";
import { GameManeger } from "../../logic";

function GridMain(props: { gameManeger: GameManeger, stage: StageMap }) {
  return (
    <div className="grid-main">
      {
        props.stage.map.map((row, rowIndex) => 
          <div className="grid-row" id={String(rowIndex)} key={rowIndex}>
            {
              row.map((v, colIndex) => {
                return <div className={`grid-col ${
                  v === "floor"
                  ? "grid-floor"
                  : v === "wall"
                  ? "grid-wall"
                  : "grid-cracked-wall"
                }`} id={String(colIndex)} key={colIndex}></div>
              })
            }
          </div>
        )
      }
      <Player gameManeger={props.gameManeger} />
    </div>
  )
}

export default GridMain;