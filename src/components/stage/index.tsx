import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger, IntervalFunction } from "../../logic";
import { StageData } from "./logic";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./gird.css"

// ステージ
function Stage(props: {
  gameManeger: GameManeger, 
  setGameManeger: (gameManeger: GameManeger) => void, 
  addIntervalFunction: (intervalFunction: IntervalFunction) => number
}) {
  // ステージのマップ
  const [stageData, setStageData] = useState<StageData>({
    gridMap: [],
    start: {
      gridX: 0,
      gridY: 0
    }
  });
  const firstRendering = useRef<boolean>(false);

  useEffect(() => {
    // ステージを読み込み
    const first = async() => {
      const [stageRes, gameManegerRes] = await invoke<[StageData, GameManeger]>("load_stage", { fileName: "stage.json", gameManeger: props.gameManeger });
      setStageData(stageRes);
      props.setGameManeger(gameManegerRes);
    }
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