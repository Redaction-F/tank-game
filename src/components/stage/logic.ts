type StageData = {
  stageId: number,
  gridMap: GridMap,
  startGrid: GridPosition,
  enemys: EnemyData[]
}
const initStageData = (): StageData => {
  return {
    stageId: 0,
    gridMap: [],
    startGrid: {
      gridX: 0,
      gridY: 0
    },
    enemys: []
  }
};
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
};

type EnemyData = {
  enemyType: "orange",
  startGrid: GridPosition
};

export { gridMapCol, gridMapRow, type GridPosition, initStageData, type StageData }