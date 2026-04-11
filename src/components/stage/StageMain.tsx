import { GameManeger, IntervalFunction } from "../../logic";
import { StageData } from "./logic";
import Player from "../player";

// ステージのメイン部分
function StageMain(props: { 
  gameManeger: GameManeger, 
  setGameManeger: (gameManeger: GameManeger) => void, 
  addIntervalFunction: (ontervalFunction: IntervalFunction) => number, 
  stage: StageData,
}) {
  return (
    <div className="grid-main">
      {/* ステージのメイン部分 */}
      {
        props.stage.gridMap.map((row, rowIndex) => 
          <div className="grid-row" id={String(rowIndex)} key={rowIndex}>
            {
              row.map((v, colIndex) => {
                return <div className={`grid ${
                  v === "floor"
                  ? "grid-floor"
                  : v === "wall"
                  ? "grid-wall"
                  : "grid-cracked-wall"
                }`} id={`${String(rowIndex)}, ${String(colIndex)}`} key={colIndex}></div>
              })
            }
          </div>
        )
      }
      {/* プレイヤー */}
      <Player 
        startGrid={props.stage.startGrid}
        gameManeger={props.gameManeger} 
        addIntervalFunction={props.addIntervalFunction} 
      />
    </div>
  )
}

export default StageMain;