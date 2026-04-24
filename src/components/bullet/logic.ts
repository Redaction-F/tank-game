import { Position } from "../../logic"

type BulletManager = {
  moveData: {
    // 位置
    position: Position,
    // 角度
    angle: number,
    size: {
      width: 8,
      height: 8,
    },
    moveType: {
      bounce: {
        max_count: number,
        count: number
      }
    },
    speed: 4.0
  }
};
const initBulletManager = (): BulletManager => {
  return {
    moveData: {
      position: {
        x: 0,
        y: 0
      },
      angle: 0,
      size: {
        width: 8,
        height: 8,
      },
      moveType: {
        bounce: {
          max_count: 0,
          count: 0
        }
      },
      speed: 4.0,
    },
  };
};

type HitTank = "player" | {
  enemy: number
} | "noHit";

export { type BulletManager, initBulletManager, type HitTank }