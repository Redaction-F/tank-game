// 垂直下方向と水平右方向が正
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

type Controller = {
  right: KeyState,
  left: KeyState,
  down: KeyState,
  up: KeyState,
  space: KeyState,
};

type CollisionManeger = {
  walls: HitBox[],
  stageSize: Size
};

type KeyState = "pressing" | "pressed" | "waiting";

type IntervalFunction = (setGameManeger: (gameManeger: GameManeger) => void) => void;

export { type Controller, type CollisionManeger, type GameManeger, type IntervalFunction, type Position, type Size }