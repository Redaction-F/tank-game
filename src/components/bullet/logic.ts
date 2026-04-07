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
      Bounce: {
        max_count: number,
        count: number
      }
    },
    speed: 1.5
  }
}

export { type BulletManeger }