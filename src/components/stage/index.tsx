import { useEffect, useState } from "react";
import { GameManeger } from "../../game_maneger/logic";
import { readStage, StageMap } from "../../game_maneger/collision_maneger";
import StageAround from "./StageAround";
import StageMain from "./StageMain";
import "./gird.css"

// ステージ
function Stage(props: {gameManeger: GameManeger}) {
  // ステージのマップ
  const [stageMap, setStageMap] = useState<StageMap>({
    map: [],
    numberOfRow: 0,
    numberOfCol: 0
  });

  useEffect(() => {
    // ステージを読み込み
    async function first() {
      setStageMap(await readStage("stage.json", props.gameManeger.collisionManeger));
    }
    first();
  }, []);

  return (
    <div className="stage">
      <StageAround stage={stageMap} />
      <StageMain gameManeger={props.gameManeger} stage={stageMap} />
    </div>
  )
}

export default Stage;