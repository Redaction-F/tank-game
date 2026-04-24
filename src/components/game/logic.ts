import { EnemyManager } from "../enemy/logic";
import { initPlayerManager, PlayerManager } from "../player/logic";

// ステージ
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
};
const gridMapCol = (stageData: StageData) => {
  return stageData.gridMap.length === 0
    ? 0
    : stageData.gridMap[0].length;
};

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

// ゲーム管理データ
type GameManager = {
  controller: Controller,
  collisionManager: CollisionManager
};
// ゲーム管理オプジェクトの初期化
const emptyGameManager = (): GameManager => {
  return {
    controller: {
      right: "waiting",
      left: "waiting",
      down: "waiting",
      up: "waiting",
      space: "waiting",
    },
    collisionManager: {
      walls: [],
      playerManager: initPlayerManager(),
      enemyManagers: [],
      stageSize: {
        width: 0,
        height: 0
      },
    },
  }
}

// 入力管理データ
type Controller = {
  right: KeyState,
  left: KeyState,
  down: KeyState,
  up: KeyState,
  space: KeyState,
};
type InputKey = {
  keydown: Set<string>,
  keyup: Set<string>,
};
const initInputKey = (): InputKey => ({
  keydown: new Set(),
  keyup: new Set()
});
// 衝突管理データ
type CollisionManager = {
  walls: HitBox[],
  playerManager: PlayerManager,
  enemyManagers: EnemyManager[],
  stageSize: Size
};
// 当たり判定
type HitBox = {
  position: Position,
  size: Size,
};
// 位置
type Position = {
  x: number,
  y: number,
};
// 大きさ
type Size = {
  width: number,
  height: number,
};

type KeyState = "justPressing" | "pressing" | "waiting";

enum Phase {
  RunFirst = 1,
  Input = 2,
  Update1 = 3,
  Update2 = 4,
  Update3 = 5,
  Render = 6,
  RunFinally = 7
};
type Task = {
  f: (() => void) | (() => Promise<void>),
  priority: Phase,
  memo: string
};
type TasksByPriority = Map<Phase, Set<Task>>;
// 定期実行する関数を設定(設定する関数はゲーム管理オブジェクト更新関数を引数に取れる)
const addTask = (tasks: TasksByPriority, newTask: Task): (() => void) => {
  let priority = newTask.priority;
  let bucket = tasks.get(priority);
  if (bucket === undefined) {
    bucket = new Set();
    tasks.set(priority, bucket);
  }
  bucket.add(newTask);
  return () => {
    bucket.delete(newTask);
    if (bucket.size === 0) {
      tasks.delete(priority);
    }
  }
};
// 定期実行する関数群を一度ずつ実行
const runTasks = async (tasks: TasksByPriority) => {
  const memos: string[] = []
  for (const phase of Object.entries(Phase).map(([_, v]) => (v)).filter((v) => (typeof v === "number"))) {
    const bucket = tasks.get(phase);
    if (bucket === undefined) {
      continue;
    }
    for (const task of bucket) {
      await task.f();
      memos.push(task.memo);
    }
  }
  // console.log(`RunTasks: ${memos.join("/")}`);
}
type GameProps = {
  gameManager: GameManager,
  setGameManager: (value: GameManager) => void,
  setGameManagerMap: (f: (value: GameManager) => void) => void,
  addTask: (newTask: Task) => (() => void),
};

export { 
  type Controller, emptyGameManager, type GameManager, initInputKey, type InputKey, type Position,
  initStageData, gridMapCol, gridMapRow, type GridPosition, type StageData, 
  addTask, type GameProps, Phase, runTasks, type Task, type TasksByPriority
}