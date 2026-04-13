import { GlobalProps } from "../../logic";
import { StageData } from "./logic";
import Player from "../player";
import Enemy from "../enemy";

// ステージのメイン部分
function StageMain(props: {
  stage: StageData,
  globalProps: GlobalProps,
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
        globalProps={props.globalProps}
      />
      {
        props.stage.enemys.map((v, i) => (
          <Enemy
            startGrid={v.startGrid}
            enemyManegerIndex={i}
            globalProps={props.globalProps}
            key={props.stage.stageId}
          />
        ))
      }
    </div>
  )
}

export default StageMain;