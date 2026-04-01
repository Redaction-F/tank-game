import { GameManeger } from "../../game_maneger/logic";
import { StageMap } from "../../game_maneger/collision_maneger";
import Player from "../player";

// ステージのメイン部分
function StageMain(props: { gameManeger: GameManeger, stage: StageMap }) {
  return (
    <div className="grid-main">
      {/* ステージのメイン部分 */}
      {
        props.stage.map.map((row, rowIndex) => 
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
      <Player gameManeger={props.gameManeger} />
    </div>
  )
}

export default StageMain;