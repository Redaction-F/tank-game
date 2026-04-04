import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GameManeger } from "../../logic";
import { StageData } from "./logic";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./gird.css"

// ステージ
function Stage(props: {gameManeger: GameManeger, setGameManeger: (gameManeger: GameManeger) => void}) {
  // ステージのマップ
  const [stageData, setStageData] = useState<StageData>({
    gridMap: [],
    start: {
      gridX: 0,
      gridY: 0
    }
  });

  useEffect(() => {
    // ステージを読み込み
    async function first() {
      const [stageRes, gameManegerRes] = await invoke<[StageData, GameManeger]>("read_stage", { fileName: "stage.json", gameManeger: props.gameManeger });
      setStageData(stageRes);
      props.setGameManeger(gameManegerRes);
    }
    first();
  }, []);

  return (
    <div className="stage">
      <StageAround stageData={stageData} />
      <StageMain gameManeger={props.gameManeger} stage={stageData} />
    </div>
  )
}

export default Stage;