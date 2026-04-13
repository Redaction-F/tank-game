// 垂直下方向と水平右方向が正

import { EnemyManeger } from "./components/enemy/logic";
import { initPlayerManeger, PlayerManeger } from "./components/player/logic";
import { ResultKind } from "./components/result/logic";

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
// 当たり判定
type HitBox = {
  position: Position,
  size: Size,
};

type GameManeger = {
  controller: Controller,
  collisionManeger: CollisionManeger
};
// ゲーム管理オプジェクトの初期化
const initGameManeger = (): GameManeger => {
  return {
    controller: {
      right: "waiting",
      left: "waiting",
      down: "waiting",
      up: "waiting",
      space: "waiting",
    },
    collisionManeger: {
      walls: [],
      playerManeger: initPlayerManeger(),
      enemyManegers: [],
      stageSize: {
        width: 0,
        height: 0
      },
    },
  }
}

type Controller = {
  right: KeyState,
  left: KeyState,
  down: KeyState,
  up: KeyState,
  space: KeyState,
};

type CollisionManeger = {
  walls: HitBox[],
  playerManeger: PlayerManeger | null,
  enemyManegers: (EnemyManeger | null)[],
  stageSize: Size
};

type KeyState = "pressing" | "pressed" | "waiting";

type IntervalFunction = (setGameManeger: (gameManeger: GameManeger) => void) => void;

type GlobalProps = {
  gameManeger: GameManeger,
  addIntervalFunction: (intervalFunction: IntervalFunction) => number
};

type Mode = "select" | {
  mode: "game",
  stageName: string
} | {
  mode: "result",
  resultKind: ResultKind
};

export { type Controller, type CollisionManeger, type GameManeger, type GlobalProps, initGameManeger, type IntervalFunction, type Mode, type Position, type Size }