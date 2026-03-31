import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import "./gird.css"
import GridAround from "./GridAround";
import GridMain from "./GridMain";

function Grid() {
  const renderedFirst = useRef<boolean>(false);
  const [stage, setStage] = useState<StageMap>({
    map: [],
    numberOfRow: 0,
    numberOfCol: 0
  });

  async function readStage(filename: string) {
    const stageTmp: {
      map: Grid[][],
      numberOfRow: number,
      numberOfCol: number,
    } = {
      map: [],
      numberOfRow: 0,
      numberOfCol: 0,
    }
    stageTmp.map = await invoke<Grid[][]>("read_stage", { filename });
    stageTmp.numberOfRow = stageTmp.map.length;
    stageTmp.numberOfCol = stageTmp.map.length === 0
      ? 0
      : stageTmp.map[0].length;
    setStage(stageTmp);
  }

  useEffect(() => {
    if (!renderedFirst.current) {
      readStage("stage.json");
      renderedFirst.current = true;
    }
  }, []);

  return (
    <div className="grid">
      <GridAround stage={stage} />
      <GridMain stage={stage} />
    </div>
  )
}

export default Grid;