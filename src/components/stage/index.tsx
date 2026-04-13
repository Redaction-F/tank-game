import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, GlobalProps } from "../../logic";
import { gridMapCol, gridMapRow, initStageData, StageData } from "./logic";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./style.css"
import { initEnemyManeger } from "../enemy/logic";

// ステージ
function Stage(props: {
  stageName: string,
  setGameManeger: (gameManeger: GameManeger) => void, 
  globalProps: GlobalProps,
}) {
  // ステージのデータ
  const [stageData, setStageData] = useState<StageData>(initStageData());
  // 初回のみ実行するためのフラグ
  const firstRendered = useRef<boolean>(false);

  useEffect(() => {
    // ステージを読み込み
    const first = async (): Promise<void> => {
      const [stageRes, gameManegerRes] = await invoke<[StageData, GameManeger]>(
        "load_stage", 
        { 
          fileName: props.stageName, 
          gameManeger: props.globalProps.gameManeger 
        }
      );
      setStageData(stageRes);
      props.setGameManeger(gameManegerRes);
      props.globalProps.gameManeger.collisionManeger.enemyManegers = new Array(stageRes.enemys.length).fill(null).map(() => initEnemyManeger());
    };
    if (firstRendered.current) {
      return;
    }
    firstRendered.current = true;
    first();
  }, []);

  return (
    <div 
      className="stage"
      style={{
        width: `${(gridMapCol(stageData) + 2) * 32}px`,
        height: `${(gridMapRow(stageData) + 2) * 32}px`
      }}
    >
      <StageAround 
        stageData={stageData} 
        key={stageData.stageId + 2000}
      />
      <StageMain 
        stage={stageData} 
        globalProps={props.globalProps}
        key={stageData.stageId}
      />
    </div>
  )
}

export default Stage;