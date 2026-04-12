import { GlobalProps } from "../../logic";
import { StageData } from "./logic";
import Player from "../player";
import { useRef, useState } from "react";
import { PlayerManeger } from "../player/logic";
import Enemy from "../enemy";

// ステージのメイン部分
function StageMain(props: {
  stage: StageData,
  globalProps: GlobalProps,
}) {
  const playerManeger = useRef<PlayerManeger | null>(null);
  const [playerManegerKey, setPlayerManegerKey] = useState<number>(0);
  const setPlayerManeger = (value: PlayerManeger) => {
    playerManeger.current = value;
    setPlayerManegerKey((pre) => 1 - pre);
  };

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
        setPlayerManeger={setPlayerManeger}
        globalProps={props.globalProps}
      />
      {
        props.stage.enemys.map((v) => (
          <Enemy
            startGrid={v.startGrid}
            playerManeger={playerManeger.current}
            globalProps={props.globalProps}
            key={playerManegerKey}
          />
        ))
      }
    </div>
  )
}

export default StageMain;