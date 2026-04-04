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
  rightPressed: boolean,
  leftPressed: boolean,
  downPressed: boolean,
  upPressed: boolean,
};

type CollisionManeger = {
  walls: HitBox[],
  stageSize: Size
};

export { type Controller, type CollisionManeger, type GameManeger, type Position, type Size }