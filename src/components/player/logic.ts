import { Position } from "../../logic";

type PlayerManeger = {
  moveData: {
    // 位置
    position: Position,
    // 角度
    angle: number,
    size: {
      width: 32,
      height: 32,
    },
    moveType: "Hit",
    speed: 2
  }
}

const initPlayerManeger = (position: Position): PlayerManeger => {
  return {
    moveData: {
      // 位置
      position,
      // 角度
      angle: 0,
      size: {
        width: 32,
        height: 32,
      },
      moveType: "Hit",
      speed: 2
    }
  }
}

export { initPlayerManeger, type PlayerManeger };