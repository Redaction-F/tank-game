type StageData = {
  gridMap: GridMap,
  start: GridPosition
}

const gridMapRow = (stageData: StageData) => {
  return stageData.gridMap.length;
}

const gridMapCol = (stageData: StageData) => {
  return stageData.gridMap.length === 0
    ? 0
    : stageData.gridMap[0].length;
}

type GridMap = Grid[][];

type Grid = "floor" | "wall" | "crackedWall";

type GridPosition = {
  gridX: number,
  gridY: number,
}

export { gridMapCol, gridMapRow, type StageData }