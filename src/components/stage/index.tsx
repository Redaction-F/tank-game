import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, GlobalProps } from "../../logic";
import { initStageData, StageData } from "./logic";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./style.css"

// ステージ
function Stage(props: {
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
          fileName: "stage.json", 
          gameManeger: props.globalProps.gameManeger 
        }
      );
      setStageData(stageRes);
      props.setGameManeger(gameManegerRes);
    };
    if (firstRendered.current) {
      return;
    }
    firstRendered.current = true;
    first();
  }, []);

  return (
    <div className="stage">
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