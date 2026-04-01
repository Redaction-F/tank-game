import { useEffect, useState } from "react";
import { readStage, StageMap } from "./logic";
import { GameManeger } from "../../logic";
import GridAround from "./GridAround";
import GridMain from "./GridMain";
import "./gird.css"

function Grid(props: {gameManeger: GameManeger}) {
  const [stageMap, setStageMap] = useState<StageMap>({
    map: [],
    numberOfRow: 0,
    numberOfCol: 0
  });

  useEffect(() => {
    async function first() {
      setStageMap(await readStage("stage.json"));
    }
    first();
  }, []);

  useEffect(() => {
    props.gameManeger.collisionManeger.updateStageMap(stageMap);
  }, [stageMap])

  return (
    <div className="grid">
      <GridAround stage={stageMap} />
      <GridMain gameManeger={props.gameManeger} stage={stageMap} />
    </div>
  )
}

export default Grid;