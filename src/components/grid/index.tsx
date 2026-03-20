import { invoke } from "@tauri-apps/api/core";
import "./gird.css"
import { useEffect, useRef, useState } from "react";

type Grid = "floor" | "wall" | "cracked_wall";

function Grid() {
  const firstRendering = useRef<boolean>(false);
  const stage = useRef<Grid[][]>([]);
  const numberOfRow = useRef<number>(0);
  const numberOfCol = useRef<number>(0);
  const [renderStage, setRenderStage] = useState<number>(0);

  function setStage(value: Grid[][]) {
    stage.current = value;
    numberOfRow.current = stage.current.length;
    numberOfCol.current = 
      stage.current.length === 0
      ? 0
      : stage.current[0].length;
    setRenderStage((prev) => 1 - prev);
  }

  async function readStage(filename: string) {
    setStage(await invoke<Grid[][]>("read_stage", { filename }));
  }

  useEffect(() => {
    if (!firstRendering.current) {
      readStage("stage.json");
      firstRendering.current = true;
    }
  }, []);

  return (
    <div className="grid" key={renderStage}>
      <div className="grid-row">
        {
          new Array(numberOfCol.current + 2).fill(true).map((_, col_index) => {
            return <div className="grid-col grid-wall" id={String(col_index)} key={col_index}></div>
          })
        }
      </div>
      {
        stage.current.map((row, row_index) => 
          <div className="grid-row" id={String(row_index)} key={row_index}>
            <div className={"grid-col grid-wall"}></div>
            {
              row.map((v, col_index) => {
                return <div className={`grid-col ${
                  v === "floor"
                  ? "grid-floor"
                  : v === "wall"
                  ? "grid-wall"
                  : "grid-cracked-wall"
                }`} id={String(col_index)} key={col_index}></div>
              })
            }
            <div className="grid-col grid-wall"></div>
          </div>
        )
      }
      <div className="grid-row">
        {
          new Array(numberOfCol.current + 2).fill(true).map((_, col_index) => {
            return <div className={"grid-col grid-wall"} id={String(col_index)} key={col_index}></div>
          })
        }
      </div>
    </div>
  )
}

export default Grid;