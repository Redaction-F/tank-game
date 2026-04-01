import { invoke } from "@tauri-apps/api/core";

type Grid = "floor" | "wall" | "cracked_wall";
type StageMap = {
  map: Grid[][],
  numberOfRow: number,
  numberOfCol: number,
};

async function readStage(filename: string) {
  const stageMap: StageMap = {
    map: [],
    numberOfRow: 0,
    numberOfCol: 0,
  }
  stageMap.map = await invoke<Grid[][]>("read_stage", { filename });
  stageMap.numberOfRow = stageMap.map.length;
  stageMap.numberOfCol = stageMap.map.length === 0
    ? 0
    : stageMap.map[0].length;
  return stageMap;
}

export { type StageMap, readStage };