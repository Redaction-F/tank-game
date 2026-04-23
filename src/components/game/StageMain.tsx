import { GameProps, StageData } from "./logic";
import Player from "../player";
import Enemy from "../enemy";

// ステージのメイン部分
function StageMain(props: {
  stage: StageData,
  gameProps: GameProps,
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
        gameProps={props.gameProps}
      />
      {
        props.stage.enemys.map((v, i) => (
          <Enemy
            startGrid={v.startGrid}
            enemyManegerIndex={i}
            gameProps={props.gameProps}
            key={props.stage.stageId * 10 + i}
          />
        ))
      }
    </div>
  )
}

export default StageMain;