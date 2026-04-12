import { Position } from "../../logic"

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
  enemyType: EnemyType
};
const initEnemyManeger = (): EnemyManeger => {
  return {
    moveData: {
      // 位置
      position: {
        x: 0,
        y: 0
      },
      // 角度
      angle: 0,
      size: {
        width: 32,
        height: 24,
      },
      moveType: "hit",
      speed: 0.0
    },
    enemyType: {
      orange: {
        shootCooldown: null,
        turnCooldown: null
      }
    }
  };
};

type EnemyType = {
  orange: {
    shootCooldown: number | null,
    turnCooldown: number | null
  }
};

export { type EnemyManeger, initEnemyManeger };