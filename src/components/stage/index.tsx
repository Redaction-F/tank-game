import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, IntervalFunction } from "../../logic";
import { initStageData, StageData } from "./logic";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./gird.css"

// ステージ
function Stage(props: {
  gameManeger: GameManeger, 
  setGameManeger: (gameManeger: GameManeger) => void, 
  addIntervalFunction: (intervalFunction: IntervalFunction) => number
}) {
  // ステージのデータ
  const [stageData, setStageData] = useState<StageData>(initStageData());
  // 初回のみ実行するためのフラグ
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    // ステージを読み込み
    const first = async (): Promise<void> => {
      const [stageRes, gameManegerRes] = await invoke<[StageData, GameManeger]>(
        "load_stage", 
        { 
          fileName: "stage.json", 
          gameManeger: props.gameManeger 
        }
      );
      setStageData(stageRes);
      props.setGameManeger(gameManegerRes);
    };
    if (firstRendering.current) {
      return;
    }
    firstRendering.current = true;
    first();
  }, []);

  return (
    <div className="stage">
      <StageAround stageData={stageData} />
      <StageMain 
        gameManeger={props.gameManeger} 
        setGameManeger={props.setGameManeger} 
        addIntervalFunction={props.addIntervalFunction} 
        stage={stageData} 
      />
    </div>
  )
}

export default Stage;