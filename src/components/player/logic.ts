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
    speed: 2.0
  }
};

export { type PlayerManeger };