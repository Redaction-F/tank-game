import { Position } from "../../logic"

type BulletManeger = {
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
    speed: 1.5
  }
};
const initBulletManeger = (): BulletManeger => {
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
      speed: 1.5,
    },
  };
};

export { type BulletManeger, initBulletManeger }