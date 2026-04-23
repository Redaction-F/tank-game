import { Position } from "../game/logic";

type EnemyManeger = {
  moveData: {
    // 位置
    position: Position,
    // 角度
    angle: number,
    size: {
      width: 32,
      height: 24,
    },
    moveType: "hit",
    speed: number
  },
  enemyType: EnemyType,
  isDead: boolean,
};

type EnemyType = {
  orange: {
    shootCooldown: number | null,
    turnCooldown: number | null
  }
};

export { type EnemyManeger };